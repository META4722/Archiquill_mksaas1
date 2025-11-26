'use server';

import { websiteConfig } from '@/config/website';
import type { User } from '@/lib/auth-types';
import { findPlanByPlanId } from '@/lib/price-plan';
import { userActionClient } from '@/lib/safe-action';
import { getUrlWithLocale } from '@/lib/urls/urls';
import { createCheckout } from '@/payment';
import type { CreateCheckoutParams } from '@/payment/types';
import { Routes } from '@/routes';
import { getLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

// Checkout schema for validation
// metadata is optional, and may contain referral information if you need
const checkoutSchema = z.object({
  userId: z.string().min(1, { error: 'User ID is required' }),
  planId: z.string().min(1, { error: 'Plan ID is required' }),
  priceId: z.string().min(1, { error: 'Price ID is required' }),
  metadata: z.record(z.string(), z.string()).optional(),
});

/**
 * Create a checkout session for a price plan
 */
export const createCheckoutAction = userActionClient
  .schema(checkoutSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { planId, priceId, metadata } = parsedInput;
    const currentUser = (ctx as { user: User }).user;

    try {
      // Get the current locale from the request
      const locale = await getLocale();

      // Check if plan exists
      const plan = findPlanByPlanId(planId);
      if (!plan) {
        return {
          success: false,
          error: 'Price plan not found',
        };
      }

      // Add user id to metadata, so we can get it in the webhook event
      const customMetadata: Record<string, string> = {
        ...metadata,
        userId: currentUser.id,
        userName: currentUser.name,
      };

      // https://datafa.st/docs/stripe-checkout-api
      // if datafast analytics is enabled, add the revenue attribution to the metadata
      if (websiteConfig.features.enableDatafastRevenueTrack) {
        const cookieStore = await cookies();
        customMetadata.datafast_visitor_id =
          cookieStore.get('datafast_visitor_id')?.value ?? '';
        customMetadata.datafast_session_id =
          cookieStore.get('datafast_session_id')?.value ?? '';
      }

      // Create the checkout session with localized URLs
      const successUrl = getUrlWithLocale(
        `${Routes.Payment}?session_id={CHECKOUT_SESSION_ID}&callback=${Routes.SettingsBilling}`,
        locale
      );
      const cancelUrl = getUrlWithLocale(Routes.SettingsBilling, locale);
      const params: CreateCheckoutParams = {
        planId,
        priceId,
        customerEmail: currentUser.email,
        metadata: customMetadata,
        successUrl,
        cancelUrl,
        locale,
      };

      const result = await createCheckout(params);
      console.log('✅ Checkout session created successfully');
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // 🔍 Enhanced error logging for production debugging
      console.error('=== Create Checkout Session Error ===');
      console.error('Error:', error);
      console.error('Plan ID:', planId);
      console.error('Price ID:', priceId);
      console.error('User ID:', currentUser.id);
      console.error('User Email:', currentUser.email);
      console.error('Stripe Secret Key exists:', !!process.env.STRIPE_SECRET_KEY);
      console.error('Stripe Secret Key starts with sk_live_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_'));
      console.error('Stripe Secret Key starts with sk_test_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_'));
      console.error('Webhook Secret exists:', !!process.env.STRIPE_WEBHOOK_SECRET);
      console.error('====================================');

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Something went wrong',
      };
    }
  });
