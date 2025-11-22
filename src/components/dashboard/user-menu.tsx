'use client';

import { UserAvatar } from '@/components/layout/user-avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Routes } from '@/routes';
import { authClient } from '@/lib/auth-client';
import { CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
}

export function UserMenu({ userName, userEmail, userImage }: UserMenuProps) {
  const t = useTranslations('Marketing.avatar');
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(Routes.Login);
        },
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 rounded-full p-0"
        >
          <UserAvatar
            name={userName || 'User'}
            image={userImage}
            className="size-8"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2 p-2">
          <UserAvatar
            name={userName || 'User'}
            image={userImage}
            className="size-9"
          />
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userName || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={Routes.SettingsProfile} className="cursor-pointer">
            <UserIcon className="mr-2 size-4" />
            <span>{t('profile')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={Routes.SettingsBilling} className="cursor-pointer">
            <CreditCardIcon className="mr-2 size-4" />
            <span>{t('billing')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={Routes.SettingsSecurity} className="cursor-pointer">
            <SettingsIcon className="mr-2 size-4" />
            <span>{t('settings')}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOutIcon className="mr-2 size-4" />
          <span>{t('logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
