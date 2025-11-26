'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePaymentCompletion } from '@/hooks/use-payment-completion';
import { useLocaleRouter } from '@/i18n/navigation';
import { PAYMENT_MAX_POLL_TIME, PAYMENT_POLL_INTERVAL } from '@/lib/constants';
import { Routes } from '@/routes';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  RefreshCwIcon,
  XCircleIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type PaymentStatus = 'processing' | 'success' | 'failed' | 'timeout';

/**
 * Payment card component to display the payment status and redirect to the callback url
 */
export function PaymentCard() {
  const t = useTranslations('Dashboard.settings.payment');
  const localeRouter = useLocaleRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('processing');
  const pollStartTime = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Get URL parameters
  const callback = searchParams.get('callback');
  const sessionId = searchParams.get('session_id');

  // Check payment completion using the existing hook
  const { data: paymentCheck } = usePaymentCompletion(
    sessionId,
    status === 'processing' && !!sessionId
  );

  // Handle payment completion polling and timeout
  useEffect(() => {
    if (sessionId && status === 'processing') {
      pollStartTime.current = Date.now();

      const checkTimeout = () => {
        if (pollStartTime.current) {
          const elapsed = Date.now() - pollStartTime.current;
          if (elapsed > PAYMENT_MAX_POLL_TIME) {
            setStatus('timeout');
            return;
          }
        }
        // Continue checking if still processing
        if (status === 'processing') {
          timeoutRef.current = setTimeout(checkTimeout, PAYMENT_POLL_INTERVAL);
        }
      };

      checkTimeout();
    }

    // Cleanup function, clear timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [sessionId, status]);

  // Handle payment completion, if payment is paid, change status to success
  useEffect(() => {
    if (paymentCheck?.isPaid && status === 'processing') {
      setStatus('success');
    }
  }, [paymentCheck, status]);

  // Handle auto-redirect for success, if status is success, redirect to callback url
  useEffect(() => {
    if (status === 'success' && callback) {
      // Async function to handle cache invalidation and redirect
      const handleRedirect = async () => {
        // Invalidate relevant cache based on callback destination
        if (callback === Routes.SettingsCredits) {
          // Invalidate and refetch credits related queries multiple times
          // to ensure we catch the webhook update
          await queryClient.invalidateQueries({
            queryKey: ['credits'],
          });

          // Refetch immediately
          await queryClient.refetchQueries({
            queryKey: ['credits'],
          });
          console.log('Refetched credits cache (attempt 1)');

          // Wait 1 second and refetch again in case webhook was slow
          await new Promise(resolve => setTimeout(resolve, 1000));
          await queryClient.refetchQueries({
            queryKey: ['credits'],
          });
          console.log('Refetched credits cache (attempt 2)');

          // Wait another 2 seconds and final refetch
          await new Promise(resolve => setTimeout(resolve, 2000));
          await queryClient.refetchQueries({
            queryKey: ['credits'],
          });
          console.log('Refetched credits cache (attempt 3)');
        } else if (callback === Routes.SettingsBilling) {
          // Invalidate and refetch payment/subscription related queries
          await queryClient.invalidateQueries({
            queryKey: ['payment'],
          });
          // Wait for the refetch to complete
          await queryClient.refetchQueries({
            queryKey: ['payment'],
          });
          console.log('Refetched payment cache for billing page');
        }

        // Redirect to callback url after cache is updated
        localeRouter.push(callback);
      };

      handleRedirect();
    }
  }, [status, localeRouter, callback, queryClient]);

  // Cleanup on unmount, clear timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <RefreshCwIcon className="h-12 w-12 text-cyan-600 animate-spin" />
        );
      case 'success':
        return <CheckCircleIcon className="h-12 w-12 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-12 w-12 text-red-600" />;
      case 'timeout':
        return <AlertCircleIcon className="h-12 w-12 text-yellow-600" />;
      default:
        return <RefreshCwIcon className="h-12 w-12 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return {
          title: t('processing.title'),
          description: t('processing.description'),
        };
      case 'success':
        return {
          title: t('success.title'),
          description: t('success.description'),
        };
      case 'failed':
        return {
          title: t('failed.title'),
          description: t('failed.description'),
        };
      case 'timeout':
        return {
          title: t('timeout.title'),
          description: t('timeout.description'),
        };
      default:
        return { title: '', description: '' };
    }
  };

  const { title, description } = getStatusMessage();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center py-4">
          <div className="flex justify-center mb-8">{getStatusIcon()}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
