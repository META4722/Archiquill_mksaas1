import { randomUUID } from 'crypto';
import { websiteConfig } from '@/config/website';
import {
  addCredits,
  addLifetimeMonthlyCredits,
  addSubscriptionCredits,
} from '@/credits/credits';
import { getCreditPackageById } from '@/credits/server';
import { CREDIT_TRANSACTION_TYPE } from '@/credits/types';
import { getDb } from '@/db';
import { payment, user } from '@/db/schema';
import type { Payment } from '@/db/types';
import {
  PAYMENT_RECORD_RETRY_ATTEMPTS,
  PAYMENT_RECORD_RETRY_DELAY,
} from '@/lib/constants';
import { findPlanByPlanId, findPriceInPlan } from '@/lib/price-plan';
import { sendNotification } from '@/notification/notification';
import { desc, eq } from 'drizzle-orm';
import { Stripe } from 'stripe';
import {
  type CheckoutResult,
  type CreateCheckoutParams,
  type CreateCreditCheckoutParams,
  type CreatePortalParams,
  type PaymentProvider,
  PaymentScenes,
  type PaymentStatus,
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PortalResult,
} from '../types';

/**
 * Stripe payment provider implementation
 *
 * docs:
 * https://mksaas.com/docs/payment
 */
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  /**
   * Initialize Stripe provider with API key
   */
  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set.');
    }

    // Initialize Stripe without specifying apiVersion to use default/latest version
    this.stripe = new Stripe(apiKey);
    this.webhookSecret = webhookSecret;
  }

  /**
   * Create a customer in Stripe if not exists
   * @param email Customer email
   * @param name Optional customer name
   * @returns Stripe customer ID
   */
  private async createOrGetCustomer(
    email: string,
    name?: string
  ): Promise<string> {
    try {
      // Search for existing customer
      const customers = await this.stripe.customers.list({
        email,
        limit: 1,
      });

      // Find existing customer
      if (customers.data && customers.data.length > 0) {
        const customerId = customers.data[0].id;

        // Find user id by customer id
        const userId = await this.findUserIdByCustomerId(customerId);
        // If no userId found, it means the user record exists (by email) but lacks customerId
        // This can happen when user was created before Stripe integration or data got out of sync
        // Fix the data inconsistency by updating the user's customerId field
        if (!userId) {
          console.log(
            'User exists but missing customerId, fixing data inconsistency'
          );
          await this.updateUserWithCustomerId(customerId, email);
        }
        return customerId;
      }

      // Create new customer
      const customer = await this.stripe.customers.create({
        email,
        name: name || undefined,
      });

      // Update user record in database with the new customer ID
      await this.updateUserWithCustomerId(customer.id, email);

      return customer.id;
    } catch (error) {
      console.error('Create or get customer error:', error);
      throw new Error('Failed to create or get customer');
    }
  }

  /**
   * Updates a user record with a Stripe customer ID
   * @param customerId Stripe customer ID
   * @param email Customer email
   * @returns Promise that resolves when the update is complete
   */
  private async updateUserWithCustomerId(
    customerId: string,
    email: string
  ): Promise<void> {
    try {
      // Update user record with customer ID if email matches
      const db = await getDb();
      const result = await db
        .update(user)
        .set({
          customerId: customerId,
          updatedAt: new Date(),
        })
        .where(eq(user.email, email))
        .returning({ id: user.id });

      if (result.length > 0) {
        console.log('Updated user with customer ID (hidden)');
      } else {
        console.log('No user found with given email');
      }
    } catch (error) {
      console.error('Update user with customer ID error:', error);
      throw new Error('Failed to update user with customer ID');
    }
  }

  /**
   * Finds a user by customerId
   * @param customerId Stripe customer ID
   * @returns User ID or undefined if not found
   */
  private async findUserIdByCustomerId(
    customerId: string
  ): Promise<string | undefined> {
    try {
      // Query the user table for a matching customerId
      const db = await getDb();
      const result = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.customerId, customerId))
        .limit(1);

      if (result.length > 0) {
        return result[0].id;
      }
      console.warn('No user found with given customerId');

      return undefined;
    } catch (error) {
      console.error('Find user by customer ID error:', error);
      return undefined;
    }
  }

  /**
   * Create a checkout session for a plan
   * @param params Parameters for creating the checkout session
   * @returns Checkout result
   */
  public async createCheckout(
    params: CreateCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      planId,
      priceId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      // Get plan and price
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        throw new Error(`Plan with ID ${planId} not found`);
      }

      // Find price in plan
      const price = findPriceInPlan(planId, priceId);
      if (!price) {
        throw new Error(`Price ID ${priceId} not found in plan ${planId}`);
      }

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata, so we can get it in the webhook event
      const customMetadata = {
        ...metadata,
        planId,
        priceId,
      };

      // Set up the line items
      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      // Create checkout session parameters
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode:
          price.type === PaymentTypes.SUBSCRIPTION ? 'subscription' : 'payment',
        success_url: successUrl ?? '',
        cancel_url: cancelUrl ?? '',
        metadata: customMetadata,
        allow_promotion_codes: price.allowPromotionCode ?? false,
      };

      // Add customer to checkout session
      checkoutParams.customer = customerId;

      // Add locale if provided
      if (locale) {
        checkoutParams.locale = this.mapLocaleToStripeLocale(
          locale
        ) as Stripe.Checkout.SessionCreateParams.Locale;
      }

      // Add payment intent data for one-time payments
      if (price.type === PaymentTypes.ONE_TIME) {
        checkoutParams.payment_intent_data = {
          metadata: customMetadata,
        };
        // Automatically create an invoice for the one-time payment
        checkoutParams.invoice_creation = {
          enabled: true,
        };
      }

      // Add subscription data for recurring payments
      if (price.type === PaymentTypes.SUBSCRIPTION) {
        // Initialize subscription_data with metadata
        checkoutParams.subscription_data = {
          metadata: customMetadata,
        };

        // Add trial period if applicable
        if (price.trialPeriodDays && price.trialPeriodDays > 0) {
          checkoutParams.subscription_data.trial_period_days =
            price.trialPeriodDays;
        }
      }

      // Create the checkout session
      const session =
        await this.stripe.checkout.sessions.create(checkoutParams);

      console.log('✅ Stripe checkout session created:', session.id);
      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      // 🔍 Enhanced error logging for production debugging
      console.error('=== Stripe Provider Error ===');
      console.error('Error:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Plan ID:', planId);
      console.error('Price ID:', priceId);
      console.error('Customer Email:', customerEmail);
      console.error('Stripe API Key configured:', !!process.env.STRIPE_SECRET_KEY);
      console.error('Webhook Secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);

      // Log specific Stripe API errors
      if (error && typeof error === 'object' && 'type' in error) {
        const stripeError = error as Stripe.StripeError;
        console.error('Stripe Error Type:', stripeError.type);
        console.error('Stripe Error Code:', stripeError.code);
        console.error('Stripe Error Message:', stripeError.message);
        console.error('Stripe Request ID:', stripeError.requestId);
      }
      console.error('============================');

      // Throw more specific error messages
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a checkout session for a plan
   * @param params Parameters for creating the checkout session
   * @returns Checkout result
   */
  public async createCreditCheckout(
    params: CreateCreditCheckoutParams
  ): Promise<CheckoutResult> {
    const {
      packageId,
      customerEmail,
      successUrl,
      cancelUrl,
      metadata,
      locale,
    } = params;

    try {
      // Get credit package
      const creditPackage = getCreditPackageById(packageId);
      if (!creditPackage) {
        throw new Error(`Credit package with ID ${packageId} not found`);
      }

      // Get priceId from credit package
      const priceId = creditPackage.price.priceId;
      if (!priceId) {
        throw new Error(`Price ID not found for credit package ${packageId}`);
      }

      // Get userName from metadata if available
      const userName = metadata?.userName;

      // Create or get customer
      const customerId = await this.createOrGetCustomer(
        customerEmail,
        userName
      );

      // Add planId and priceId to metadata, so we can get it in the webhook event
      const customMetadata = {
        ...metadata,
        packageId,
        priceId,
      };

      // Set up the line items
      const lineItems = [
        {
          price: priceId,
          quantity: 1,
        },
      ];

      // Create checkout session parameters
      const checkoutParams: Stripe.Checkout.SessionCreateParams = {
        line_items: lineItems,
        mode: 'payment',
        success_url: successUrl ?? '',
        cancel_url: cancelUrl ?? '',
        metadata: customMetadata,
        allow_promotion_codes: creditPackage.price.allowPromotionCode ?? false,
      };

      // Add customer to checkout session
      checkoutParams.customer = customerId;

      // Add locale if provided
      if (locale) {
        checkoutParams.locale = this.mapLocaleToStripeLocale(
          locale
        ) as Stripe.Checkout.SessionCreateParams.Locale;
      }

      // Add payment intent data for one-time payments
      checkoutParams.payment_intent_data = {
        metadata: customMetadata,
      };
      // Automatically create an invoice for the one-time payment
      checkoutParams.invoice_creation = {
        enabled: true,
      };

      // Create the checkout session
      const session =
        await this.stripe.checkout.sessions.create(checkoutParams);

      return {
        url: session.url!,
        id: session.id,
      };
    } catch (error) {
      console.error('Create credit checkout session error:', error);
      throw new Error('Failed to create credit checkout session');
    }
  }

  /**
   * Create a customer portal session
   * @param params Parameters for creating the portal
   * @returns Portal result
   */
  public async createCustomerPortal(
    params: CreatePortalParams
  ): Promise<PortalResult> {
    const { customerId, returnUrl, locale } = params;

    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl ?? '',
        locale: locale
          ? (this.mapLocaleToStripeLocale(
              locale
            ) as Stripe.BillingPortal.SessionCreateParams.Locale)
          : undefined,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Create customer portal error:', error);
      throw new Error('Failed to create customer portal');
    }
  }

  /**
   * Handle webhook event
   * @param payload Raw webhook payload
   * @param signature Webhook signature
   */
  public async handleWebhookEvent(
    payload: string,
    signature: string
  ): Promise<void> {
    try {
      // Verify the event signature if webhook secret is available
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );
      const eventType = event.type;
      console.log(`handle webhook event, type: ${eventType}`);

      // Handle subscription events
      if (eventType.startsWith('customer.subscription.')) {
        const stripeSubscription = event.data.object as Stripe.Subscription;

        // Process based on subscription status and event type
        switch (eventType) {
          case 'customer.subscription.created': {
            await this.onCreateSubscription(stripeSubscription);
            break;
          }
          case 'customer.subscription.updated': {
            await this.onUpdateSubscription(stripeSubscription);
            break;
          }
          case 'customer.subscription.deleted': {
            await this.onDeleteSubscription(stripeSubscription);
            break;
          }
        }
      } else if (eventType.startsWith('invoice.')) {
        // Handle invoice events
        switch (eventType) {
          case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            await this.onInvoicePaid(invoice);
            break;
          }
        }
      } else if (eventType.startsWith('checkout.')) {
        // Handle checkout events
        if (eventType === 'checkout.session.completed') {
          const session = event.data.object as Stripe.Checkout.Session;
          await this.onCheckoutCompleted(session);
        }
      }
    } catch (error) {
      console.error('handle webhook event error:', error);
      throw new Error('Failed to handle webhook event');
    }
  }

  /**
   * Find existing payment record by Invoice
   * @param invoice Stripe invoice
   * @returns Payment record or null if not found
   */
  private async findPaymentRecord(
    invoice: Stripe.Invoice
  ): Promise<Payment | null> {
    try {
      const db = await getDb();

      // Strategy 1: Find by invoice ID (most reliable)
      if (invoice.id) {
        const paymentsByInvoice = await db
          .select()
          .from(payment)
          .where(eq(payment.invoiceId, invoice.id))
          .orderBy(desc(payment.createdAt))
          .limit(1);

        if (paymentsByInvoice.length > 0) {
          console.log('Found payment record by invoice ID');
          return paymentsByInvoice[0];
        }
      }

      // Strategy 2: For subscription payments, find by subscription ID
      if (invoice.subscription) {
        const subscriptionId = invoice.subscription as string;
        const paymentsBySubscription = await db
          .select()
          .from(payment)
          .where(eq(payment.subscriptionId, subscriptionId))
          .orderBy(desc(payment.createdAt))
          .limit(1);

        if (paymentsBySubscription.length > 0) {
          console.log('Found payment record by subscription ID');
          return paymentsBySubscription[0];
        }
      }

      console.warn('No payment record found for invoice:', invoice.id);
      return null;
    } catch (error) {
      console.error('Find payment record error:', error);
      return null;
    }
  }

  /**
   * Find payment record with retry mechanism to handle race conditions
   * @param invoice Stripe invoice
   * @returns Payment record or null if not found after all retries
   */
  private async findPaymentRecordWithRetry(
    invoice: Stripe.Invoice
  ): Promise<Payment | null> {
    console.log(`>> Find payment record for invoice: ${invoice.id}`);

    for (let attempt = 1; attempt <= PAYMENT_RECORD_RETRY_ATTEMPTS; attempt++) {
      const paymentRecord = await this.findPaymentRecord(invoice);

      if (paymentRecord) {
        console.log(`<< Found payment record on attempt ${attempt}`);
        return paymentRecord;
      }

      if (attempt < PAYMENT_RECORD_RETRY_ATTEMPTS) {
        console.log(
          `Payment record not found, retry in ${PAYMENT_RECORD_RETRY_DELAY}ms`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, PAYMENT_RECORD_RETRY_DELAY)
        );
      }
    }

    console.error('<< Payment record not found after all attempts');
    return null;
  }

  /**
   * Handle successful invoice payment - NEW ARCHITECTURE
   * Find existing payment record and update all fields appropriately
   *
   * For one-time payments, the order of events may be:
   * checkout.session.completed
   * invoice.paid
   *
   * For subscription payments, the order of events may be:
   * checkout.session.completed
   * customer.subscription.created
   * customer.subscription.updated
   * invoice.paid
   *
   * For subscription renewals, the order of events may be:
   * customer.subscription.updated
   * invoice.paid  (a new invoice, but same payment record is used)
   *
   * User can update the subscription in customer portal,
   * For subscription upgrades, the order of events may be:
   * invoice.paid  (a new invoice, but same payment record is used)
   *
   * @param invoice Stripe invoice
   */
  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    console.log('>> Handle invoice paid, invoiceId:', invoice.id);

    try {
      // Find existing payment record with retry mechanism
      const paymentRecord = await this.findPaymentRecordWithRetry(invoice);
      if (!paymentRecord) {
        console.error('<< Payment record not found for invoice:', invoice.id);
        throw new Error(`Payment record not found for invoice: ${invoice.id}`);
      }

      // Determine payment type based on existing payment record type
      // This is more reliable than checking invoice.subscription field
      const isSubscriptionPayment =
        paymentRecord.type === PaymentTypes.SUBSCRIPTION;

      if (isSubscriptionPayment) {
        // This is a subscription payment
        await this.updateSubscriptionPayment(invoice, paymentRecord);
      } else {
        // This is a one-time payment
        await this.updateOneTimePayment(invoice, paymentRecord);
      }
    } catch (error) {
      console.error('<< Handle invoice paid error:', error);

      // Check if it's a duplicate invoice error (database constraint violation)
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Invoice already processed:', invoice.id);
        return; // Don't throw, this is expected for duplicate processing
      }

      // For other errors, let Stripe retry
      throw error;
    }

    console.log('<< Handle invoice paid success');
  }

  /**
   * Update subscription payment record and process benefits - NEW ARCHITECTURE
   *
   * The order of events may be:
   * checkout.session.completed
   * customer.subscription.created
   * customer.subscription.updated
   * invoice.paid
   *
   * @param invoice Stripe invoice
   * @param paymentRecord Payment record
   */
  private async updateSubscriptionPayment(
    invoice: Stripe.Invoice,
    paymentRecord: Payment
  ): Promise<void> {
    console.log('>> Update subscription payment record');

    try {
      let subscriptionId = invoice.subscription as string | null;

      // If invoice.subscription is null, try to use paymentRecord.subscriptionId
      if (!subscriptionId && paymentRecord.subscriptionId) {
        subscriptionId = paymentRecord.subscriptionId;
        console.log('subscriptionId from paymentRecord:', subscriptionId);
      }

      if (!subscriptionId) {
        console.warn('<< No subscriptionId found in invoice or paymentRecord');
        return;
      }

      // Get subscription details from Stripe
      const subscription =
        await this.stripe.subscriptions.retrieve(subscriptionId);
      const customerId = subscription.customer as string;

      // Get priceId from subscription items
      const priceId = subscription.items.data[0]?.price.id;
      if (!priceId) {
        console.warn('<< No priceId found for subscription');
        return;
      }

      // Get userId from subscription metadata or fallback to customerId lookup
      let userId: string | undefined = subscription.metadata.userId;

      // If no userId in metadata (common in renewals), find by customerId
      if (!userId) {
        console.log('No userId in metadata, finding by customerId');
        userId = await this.findUserIdByCustomerId(customerId);

        if (!userId) {
          console.error('<< No userId found, this should not happen');
          return;
        }
      }

      const periodStart = this.getPeriodStart(subscription);
      const periodEnd = this.getPeriodEnd(subscription);
      const trialStart = subscription.trial_start
        ? new Date(subscription.trial_start * 1000)
        : null;
      const trialEnd = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;
      const currentDate = new Date();

      // Update payment record with all subscription details
      const db = await getDb();
      await db
        .update(payment)
        .set({
          // invoiceId: invoice.id, // do not update invoiceId
          paid: true, // Mark as paid
          interval: this.mapStripeIntervalToPlanInterval(subscription),
          status: this.mapSubscriptionStatusToPaymentStatus(
            subscription.status
          ),
          periodStart,
          periodEnd,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          trialStart,
          trialEnd,
          updatedAt: currentDate,
        })
        .where(eq(payment.id, paymentRecord.id));

      // Process subscription benefits
      await this.processSubscriptionPurchase(userId, priceId);
    } catch (error) {
      console.error('<< Update subscription payment error:', error);
      throw error;
    }

    console.log('<< Update subscription payment record success');
  }

  /**
   * Process subscription purchase
   * @param userId User ID
   * @param priceId Price ID
   */
  private async processSubscriptionPurchase(
    userId: string,
    priceId: string
  ): Promise<void> {
    console.log('>> Process subscription purchase');

    if (websiteConfig.credits?.enableCredits) {
      await addSubscriptionCredits(userId, priceId);
      console.log('Added subscription credits for user:', userId);
    }

    console.log('<< Process subscription purchase success');
  }

  /**
   * Update one-time payment record and process benefits - NEW ARCHITECTURE
   *
   * The order of events may be:
   * checkout.session.completed
   * invoice.paid
   *
   * @param invoice Stripe invoice
   * @param paymentRecord Payment record
   */
  private async updateOneTimePayment(
    invoice: Stripe.Invoice,
    paymentRecord: Payment
  ): Promise<void> {
    console.log('>> Update one-time payment record');

    try {
      // Update payment record with invoice details
      const db = await getDb();
      await db
        .update(payment)
        .set({
          // invoiceId: invoice.id, // do not update invoiceId
          status: 'completed', // One-time payments are completed when invoice is paid
          paid: true, // Mark as paid
          updatedAt: new Date(),
        })
        .where(eq(payment.id, paymentRecord.id));

      // Process benefits based on payment type
      if (paymentRecord.sessionId) {
        const session = await this.stripe.checkout.sessions.retrieve(
          paymentRecord.sessionId
        );
        const metadata = session.metadata || {};
        const isCreditPurchase = metadata.type === 'credit_purchase';

        if (isCreditPurchase) {
          // Process credit purchase
          await this.processCreditPurchase(invoice, paymentRecord, metadata);
        } else {
          // Process lifetime plan purchase
          await this.processLifetimePlanPurchase(invoice, paymentRecord);
        }
      }
    } catch (error) {
      console.error('<< Update one-time payment error:', error);
      throw error;
    }

    console.log('<< Update one-time payment record success');
  }

  /**
   * Process credit purchase
   * @param invoice Stripe invoice
   * @param paymentRecord Payment record
   * @param metadata Checkout session metadata
   */
  private async processCreditPurchase(
    invoice: Stripe.Invoice,
    paymentRecord: Payment,
    metadata: { [key: string]: string }
  ): Promise<void> {
    console.log('>> Process credit purchase');

    const packageId = metadata.packageId;
    const credits = metadata.credits;

    if (!packageId || !credits) {
      console.warn('<< Missing packageId or credits in metadata');
      return;
    }

    // Get credit package
    const creditPackage = getCreditPackageById(packageId);
    if (!creditPackage) {
      console.warn('<< Credit package not found:', packageId);
      return;
    }

    // Add credits to user account
    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
    await addCredits({
      userId: paymentRecord.userId,
      amount: Number.parseInt(credits),
      type: CREDIT_TRANSACTION_TYPE.PURCHASE_PACKAGE,
      description: `+${credits} credits for package ${packageId} ($${amount.toLocaleString()})`,
      paymentId: invoice.id,
      expireDays: creditPackage.expireDays,
    });

    console.log('<< Process credit purchase success');
  }

  /**
   * Process lifetime plan purchase
   * @param invoice Stripe invoice
   * @param paymentRecord Payment record
   */
  private async processLifetimePlanPurchase(
    invoice: Stripe.Invoice,
    paymentRecord: Payment
  ): Promise<void> {
    console.log('>> Process lifetime plan purchase');

    // Add lifetime credits if enabled
    if (websiteConfig.credits?.enableCredits) {
      await addLifetimeMonthlyCredits(
        paymentRecord.userId,
        paymentRecord.priceId
      );
      console.log('Added lifetime credits for user:', paymentRecord.userId);
    }

    // Send notification
    const amount = invoice.amount_paid ? invoice.amount_paid / 100 : 0;
    await sendNotification(
      invoice.id,
      paymentRecord.customerId,
      paymentRecord.userId,
      amount
    );

    console.log('<< Process lifetime plan purchase success');
  }

  /**
   * Handle subscription creation - NEW ARCHITECTURE
   * Only log the event, payment records created in checkout.session.completed
   * @param stripeSubscription Stripe subscription
   */
  private async onCreateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('Handle subscription creation:', stripeSubscription.id);
  }

  /**
   * Update payment record when subscription is updated
   *
   * When subscription is renewed, the order of events may be:
   * customer.subscription.updated
   * invoice.paid
   *
   * When subscription is cancelled, the order of events may be:
   * customer.subscription.updated
   *
   * In this case, we need to update the payment record.
   *
   * @param stripeSubscription Stripe subscription
   */
  private async onUpdateSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Handle subscription update:', stripeSubscription.id);

    // get priceId from subscription items (this is always available)
    const priceId = stripeSubscription.items.data[0]?.price.id;
    if (!priceId) {
      console.warn('<< No priceId found for subscription');
      return;
    }

    // get new period start and end
    const newPeriodStart = this.getPeriodStart(stripeSubscription);
    const newPeriodEnd = this.getPeriodEnd(stripeSubscription);
    const trialStart = stripeSubscription.trial_start
      ? new Date(stripeSubscription.trial_start * 1000)
      : undefined;
    const trialEnd = stripeSubscription.trial_end
      ? new Date(stripeSubscription.trial_end * 1000)
      : undefined;

    // update fields
    const updateFields: any = {
      priceId: priceId,
      interval: this.mapStripeIntervalToPlanInterval(stripeSubscription),
      status: this.mapSubscriptionStatusToPaymentStatus(
        stripeSubscription.status
      ),
      periodStart: newPeriodStart,
      periodEnd: newPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      trialStart: trialStart,
      trialEnd: trialEnd,
      updatedAt: new Date(),
    };

    const db = await getDb();
    const result = await db
      .update(payment)
      .set(updateFields)
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Updated payment record for subscription');
    } else {
      console.warn('<< No payment record found for subscription update');
    }
  }

  /**
   * Update payment record when subscription is deleted
   *
   * When subscription is deleted, the order of events may be:
   * customer.subscription.deleted
   *
   * In this case, we need to update the payment record.
   *
   * @param stripeSubscription Stripe subscription
   */
  private async onDeleteSubscription(
    stripeSubscription: Stripe.Subscription
  ): Promise<void> {
    console.log('>> Handle subscription deletion:', stripeSubscription.id);

    const db = await getDb();
    const result = await db
      .update(payment)
      .set({
        status: this.mapSubscriptionStatusToPaymentStatus(
          stripeSubscription.status
        ),
        updatedAt: new Date(),
      })
      .where(eq(payment.subscriptionId, stripeSubscription.id))
      .returning({ id: payment.id });

    if (result.length > 0) {
      console.log('<< Marked payment record for subscription as canceled');
    } else {
      console.warn('<< No payment record found for subscription deletion');
    }
  }

  /**
   * Handle checkout session completion - NEW ARCHITECTURE
   * Create payment records with paid=false
   * @param session Stripe checkout session
   */
  private async onCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log('>> Handle checkout session completion:', session.id);

    // I have simulated with 10-second delay to test behavior when invoice paid event arrives first
    try {
      if (session.mode === 'subscription') {
        await this.createSubscriptionPaymentRecord(session);
      } else if (session.mode === 'payment') {
        await this.createOneTimePaymentRecord(session);
      } else {
        console.warn('<< Unsupported checkout session mode:', session.mode);
        return;
      }
    } catch (error) {
      console.error('<< Handle checkout session completion error:', error);
      throw error;
    }

    console.log('<< Handle checkout session completion success');
  }

  /**
   * Create subscription payment record in checkout.session.completed event
   * @param session Stripe checkout session
   */
  private async createSubscriptionPaymentRecord(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log('>> Create subscription payment record');

    if (!session.subscription) {
      console.warn('<< No subscription found in session');
      return;
    }

    const subscriptionId = session.subscription as string;
    const subscription =
      await this.stripe.subscriptions.retrieve(subscriptionId);

    // Get priceId from subscription items
    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      console.warn('<< No priceId found for subscription');
      return;
    }

    const currentDate = new Date();
    const userId = session.metadata?.userId!;
    const customerId = session.customer as string;

    // No matter user uses coupon code or not, even amount=0, invoice id is available
    const invoiceId: string | null = session.invoice as string | null;
    console.log('createSubscriptionPaymentRecord, invoiceId:', invoiceId);

    const periodStart = this.getPeriodStart(subscription);
    const periodEnd = this.getPeriodEnd(subscription);
    const trialStart = subscription.trial_start
      ? new Date(subscription.trial_start * 1000)
      : null;
    const trialEnd = subscription.trial_end
      ? new Date(subscription.trial_end * 1000)
      : null;

    // Create subscription payment record with proper status and paid=false
    const db = await getDb();

    try {
      await db.insert(payment).values({
        id: randomUUID(),
        priceId,
        type: PaymentTypes.SUBSCRIPTION,
        scene: PaymentScenes.SUBSCRIPTION,
        userId,
        customerId,
        subscriptionId,
        sessionId: session.id,
        invoiceId, // may be null initially
        paid: false, // will be set to true when invoice.paid event occurs
        interval: this.mapStripeIntervalToPlanInterval(subscription),
        status: this.mapSubscriptionStatusToPaymentStatus(subscription.status),
        periodStart,
        periodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        trialStart,
        trialEnd,
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      console.log('<< Created subscription payment record success');
    } catch (error) {
      // Handle duplicate key constraint violation
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Payment record already exists, skipping creation');
        return; // Don't throw, this is expected for duplicate processing
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Create one-time payment record in checkout.session.completed event
   * @param session Stripe checkout session
   */
  private async createOneTimePaymentRecord(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    console.log('>> Create one-time payment record');

    const priceId = session.metadata?.priceId;
    if (!priceId) {
      console.warn('<< No priceId found in session metadata');
      return;
    }

    const currentDate = new Date();
    const userId = session.metadata?.userId!;
    const customerId = session.customer as string;

    // No matter user uses coupon code or not, even amount=0, invoice id is available
    const invoiceId: string | null = session.invoice as string | null;
    console.log('createOneTimePaymentRecord, invoiceId:', invoiceId);

    // Determine payment scene based on metadata
    const metadata = session.metadata || {};
    const isCreditPurchase = metadata.type === 'credit_purchase';
    const scene = isCreditPurchase
      ? PaymentScenes.CREDIT
      : PaymentScenes.LIFETIME;

    // Create one-time payment record with proper status and paid=false
    const db = await getDb();

    try {
      await db.insert(payment).values({
        id: randomUUID(),
        priceId,
        type: PaymentTypes.ONE_TIME,
        scene,
        userId,
        customerId,
        sessionId: session.id,
        invoiceId, // may be null initially
        paid: false, // will be set to true when invoice.paid event occurs
        status: 'completed', // one-time payments are completed once checkout is done
        createdAt: currentDate,
        updatedAt: currentDate,
      });

      console.log('<< Created one-time payment record success');
    } catch (error) {
      // Handle duplicate key constraint violation
      if (
        error instanceof Error &&
        error.message.includes('unique constraint')
      ) {
        console.log('<< Payment record already exists, skipping creation');
        return; // Don't throw, this is expected for duplicate processing
      }

      // Re-throw other errors
      throw error;
    }
  }

  /**
   * Map Stripe subscription interval to our own interval types
   * @param subscription Stripe subscription
   * @returns PlanInterval
   */
  private mapStripeIntervalToPlanInterval(
    subscription: Stripe.Subscription
  ): PlanInterval {
    switch (subscription.items.data[0]?.plan.interval) {
      case 'month':
        return PlanIntervals.MONTH;
      case 'year':
        return PlanIntervals.YEAR;
      default:
        return PlanIntervals.MONTH;
    }
  }

  /**
   * Convert Stripe subscription status to PaymentStatus,
   * we narrow down the status to our own status types
   * @param status Stripe subscription status
   * @returns PaymentStatus
   */
  private mapSubscriptionStatusToPaymentStatus(
    status: Stripe.Subscription.Status
  ): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      active: 'active',
      canceled: 'canceled',
      incomplete: 'incomplete',
      incomplete_expired: 'incomplete_expired',
      past_due: 'past_due',
      trialing: 'trialing',
      unpaid: 'unpaid',
      paused: 'paused',
    };

    return statusMap[status] || 'failed';
  }

  /**
   * Map application locale to Stripe's supported locales
   * @param locale Application locale (e.g., 'en', 'zh-CN')
   * @returns Stripe locale string
   */
  private mapLocaleToStripeLocale(locale: string): string {
    // Stripe supported locales as of 2023:
    // https://stripe.com/docs/js/appendix/supported_locales
    const stripeLocales = [
      'bg',
      'cs',
      'da',
      'de',
      'el',
      'en',
      'es',
      'et',
      'fi',
      'fil',
      'fr',
      'hr',
      'hu',
      'id',
      'it',
      'ja',
      'ko',
      'lt',
      'lv',
      'ms',
      'mt',
      'nb',
      'nl',
      'pl',
      'pt',
      'ro',
      'ru',
      'sk',
      'sl',
      'sv',
      'th',
      'tr',
      'vi',
      'zh',
    ];

    // First check if the exact locale is supported
    if (stripeLocales.includes(locale)) {
      return locale;
    }

    // If not, try to get the base language
    const baseLocale = locale.split('-')[0];
    if (stripeLocales.includes(baseLocale)) {
      return baseLocale;
    }

    // Default to auto to let Stripe detect the language
    return 'auto';
  }

  private getPeriodStart(subscription: Stripe.Subscription): Date | undefined {
    const s: any = subscription as any;
    const startUnix =
      s.current_period_start ??
      s?.items?.data?.[0]?.current_period_start ??
      undefined;
    return typeof startUnix === 'number'
      ? new Date(startUnix * 1000)
      : undefined;
  }

  private getPeriodEnd(subscription: Stripe.Subscription): Date | undefined {
    const s: any = subscription as any;
    const endUnix =
      s.current_period_end ??
      s?.items?.data?.[0]?.current_period_end ??
      undefined;
    return typeof endUnix === 'number' ? new Date(endUnix * 1000) : undefined;
  }
}
