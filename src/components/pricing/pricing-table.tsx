'use client';

import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { usePricePlans } from '@/config/price-config';
import { cn } from '@/lib/utils';
import {
  PaymentTypes,
  type PlanInterval,
  PlanIntervals,
  type PricePlan,
} from '@/payment/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PricingCard } from './pricing-card';

interface PricingTableProps {
  metadata?: Record<string, string>;
  currentPlan?: PricePlan | null;
  className?: string;
}

export function PricingTable({
  metadata,
  currentPlan,
  className,
}: PricingTableProps) {
  const t = useTranslations('PricingPage');
  const [interval, setInterval] = useState<PlanInterval>(PlanIntervals.YEAR);

  const pricePlans = usePricePlans();
  const plans = Object.values(pricePlans);
  const currentPlanId = currentPlan?.id || null;

  const freePlans = plans.filter((plan) => plan.isFree && !plan.disabled);
  const subscriptionPlans = plans.filter(
    (plan) =>
      !plan.isFree &&
      !plan.disabled &&
      plan.prices.some(
        (price) => !price.disabled && price.type === PaymentTypes.SUBSCRIPTION
      )
  );
  const oneTimePlans = plans.filter(
    (plan) =>
      !plan.isFree &&
      !plan.disabled &&
      plan.prices.some(
        (price) => !price.disabled && price.type === PaymentTypes.ONE_TIME
      )
  );

  const hasMonthlyOption = subscriptionPlans.some((plan) =>
    plan.prices.some(
      (price) =>
        price.type === PaymentTypes.SUBSCRIPTION &&
        price.interval === PlanIntervals.MONTH
    )
  );
  const hasYearlyOption = subscriptionPlans.some((plan) =>
    plan.prices.some(
      (price) =>
        price.type === PaymentTypes.SUBSCRIPTION &&
        price.interval === PlanIntervals.YEAR
    )
  );

  return (
    <div className={cn('flex flex-col gap-8', className)}>
      {/* Trust line */}
      <p className="text-center text-sm text-muted-foreground">
        {t('trustLine')}
      </p>

      {/* Interval toggle */}
      {(hasMonthlyOption || hasYearlyOption) && subscriptionPlans.length > 0 && (
        <div className="flex justify-center items-center gap-3">
          <ToggleGroup
            size="sm"
            type="single"
            value={interval}
            onValueChange={(value) => value && setInterval(value as PlanInterval)}
            className="border rounded-lg p-1"
          >
            {hasMonthlyOption && (
              <ToggleGroupItem
                value="month"
                className={cn(
                  'px-3 py-0 cursor-pointer text-sm rounded-md',
                  'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                )}
              >
                {t('monthly')}
              </ToggleGroupItem>
            )}
            {hasYearlyOption && (
              <ToggleGroupItem
                value="year"
                className={cn(
                  'px-3 py-0 cursor-pointer text-sm rounded-md',
                  'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground'
                )}
              >
                {t('yearly')}
              </ToggleGroupItem>
            )}
          </ToggleGroup>
          {hasYearlyOption && interval === PlanIntervals.YEAR && (
            <Badge className="bg-green-500 hover:bg-green-500 text-white text-xs px-2 py-0.5">
              {t('yearlyBadge')}
            </Badge>
          )}
        </div>
      )}

      {/* Plan cards */}
      {(() => {
        const totalVisiblePlans =
          freePlans.length + subscriptionPlans.length + oneTimePlans.length;
        return (
          <div
            className={cn(
              'grid gap-6',
              totalVisiblePlans === 1 && 'grid-cols-1 max-w-md mx-auto w-full',
              totalVisiblePlans === 2 &&
                'grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto w-full',
              totalVisiblePlans >= 3 &&
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}
          >
            {freePlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                metadata={metadata}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))}
            {subscriptionPlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                interval={interval}
                paymentType={PaymentTypes.SUBSCRIPTION}
                metadata={metadata}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))}
            {oneTimePlans.map((plan) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                paymentType={PaymentTypes.ONE_TIME}
                metadata={metadata}
                isCurrentPlan={currentPlanId === plan.id}
              />
            ))}
          </div>
        );
      })()}
    </div>
  );
}
