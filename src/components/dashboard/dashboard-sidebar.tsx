'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useSidebarLinks } from '@/config/sidebar-config';
import { websiteConfig } from '@/config/website';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import type { NestedMenuItem } from '@/types';
import { ChevronRightIcon, LogOutIcon } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import type { ComponentProps } from 'react';

export function DashboardSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const sidebarLinks = useSidebarLinks();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
        },
      },
    });
  };

  // Filter links based on user role
  const filteredLinks = sidebarLinks.filter((link) => {
    if (!link.authorizeOnly) return true;
    const userRole = session?.user?.role || 'user';
    return link.authorizeOnly.includes(userRole);
  });

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname.includes(href);
  };

  return (
    <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <LocaleLink href={Routes.Root}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  {websiteConfig.metadata.images?.logoLight && (
                    <Image
                      src={websiteConfig.metadata.images.logoLight}
                      alt="ArchiQuill Logo"
                      width={32}
                      height={32}
                      className="size-6"
                    />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ArchiQuill</span>
                </div>
              </LocaleLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {filteredLinks.map((item) => (
                <NavItem key={item.title} item={item} isActive={isActive} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOutIcon className="size-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}

function NavItem({
  item,
  isActive,
}: {
  item: NestedMenuItem;
  isActive: (href?: string) => boolean;
}) {
  if (item.items && item.items.length > 0) {
    return (
      <Collapsible asChild defaultOpen className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton>
              {item.icon}
              <span>{item.title}</span>
              <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.items.map((subItem) => (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    className={cn(
                      isActive(subItem.href) &&
                        'bg-accent text-accent-foreground'
                    )}
                  >
                    <LocaleLink href={subItem.href || '#'}>
                      {subItem.icon}
                      <span>{subItem.title}</span>
                    </LocaleLink>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className={cn(
          isActive(item.href) && 'bg-accent text-accent-foreground'
        )}
      >
        <LocaleLink href={item.href || '#'}>
          {item.icon}
          <span>{item.title}</span>
        </LocaleLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
