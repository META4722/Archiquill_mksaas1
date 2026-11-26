'use client';

import { DividerWithText } from '@/components/auth/divider-with-text';
import { GitHubIcon } from '@/components/icons/github';
import { GoogleIcon } from '@/components/icons/google';
import { FormError } from '@/components/shared/form-error';
import { Button } from '@/components/ui/button';
import { websiteConfig } from '@/config/website';
import { authClient } from '@/lib/auth-client';
import { getAuthCallbackPath } from '@/lib/urls/urls';
import { Routes } from '@/routes';
import { Loader2Icon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

interface SocialLoginButtonProps {
  callbackUrl: string;
  showDivider?: boolean;
}

/**
 * social login buttons
 */
export const SocialLoginButton = ({
  callbackUrl,
  showDivider = true,
}: SocialLoginButtonProps) => {
  if (
    !websiteConfig.auth.enableGoogleLogin &&
    !websiteConfig.auth.enableGithubLogin
  ) {
    return null;
  }

  const t = useTranslations('AuthPage.login');
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState<'google' | 'github' | null>(null);
  const [error, setError] = useState<string>();

  const onClick = async (provider: 'google' | 'github') => {
    setIsLoading(provider);
    setError(undefined);

    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: callbackUrl,
        errorCallbackURL: getAuthCallbackPath(null, Routes.AuthError, locale),
      });

      if (error) {
        setError(t('socialLoginFailed'));
        setIsLoading(null);
      }
    } catch {
      setError(t('socialLoginFailed'));
      setIsLoading(null);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <FormError message={error} />
      {showDivider && <DividerWithText text={t('or')} />}
      {websiteConfig.auth.enableGoogleLogin && (
        <Button
          size="lg"
          className="w-full cursor-pointer"
          variant="outline"
          onClick={() => onClick('google')}
          disabled={isLoading !== null}
        >
          {isLoading === 'google' ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4 mr-2" />
          )}
          <span>{t('signInWithGoogle')}</span>
        </Button>
      )}
      {websiteConfig.auth.enableGithubLogin && (
        <Button
          size="lg"
          className="w-full cursor-pointer"
          variant="outline"
          onClick={() => onClick('github')}
          disabled={isLoading !== null}
        >
          {isLoading === 'github' ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <GitHubIcon className="size-4 mr-2" />
          )}
          <span>{t('signInWithGitHub')}</span>
        </Button>
      )}
    </div>
  );
};
