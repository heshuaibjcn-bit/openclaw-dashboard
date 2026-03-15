"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  LayoutDashboard,
  Activity,
  MessageSquare,
  Bot,
  Radio,
  FileText,
  Database,
  Settings,
  HelpCircle,
  TrendingUp,
  Users,
  CheckSquare,
  Shield,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';

const navConfig = [
  {
    key: "overview",
    icon: LayoutDashboard,
  },
  {
    key: "usage",
    icon: TrendingUp,
  },
  {
    key: "staff",
    icon: Users,
  },
  {
    key: "tasks",
    icon: CheckSquare,
  },
  {
    key: "gateway",
    icon: Activity,
  },
  {
    key: "sessions",
    icon: MessageSquare,
  },
  {
    key: "agents",
    icon: Bot,
  },
  {
    key: "channels",
    icon: Radio,
  },
  {
    key: "logs",
    icon: FileText,
  },
  {
    key: "memory",
    icon: Database,
  },
  {
    key: "approvals",
    icon: Shield,
  },
  {
    key: "chat",
    icon: MessageSquare,
  },
];

const secondaryConfig = [
  {
    key: "settings",
    icon: Settings,
  },
  {
    key: "help",
    icon: HelpCircle,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <SidebarProvider>
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:ring-2 focus:ring-ring"
      >
        {t('sidebar.header.title')}
      </a>

      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              🦞
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">{t('sidebar.brand.name')}</span>
              <span className="text-xs text-muted-foreground">{t('sidebar.brand.tagline')}</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.groups.dashboard')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navConfig.slice(0, 4).map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <Link href={`/${locale}${item.key === 'overview' ? '' : '/' + item.key}`} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                      <item.icon className="h-4 w-4" />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* System Status */}
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.groups.system')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navConfig.slice(4, 7).map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <Link href={`/${locale}/${item.key}`} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                      <item.icon className="h-4 w-4" />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* AI & Memory */}
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.groups.ai_memory')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navConfig.slice(7).map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <Link href={`/${locale}/${item.key}`} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                      <item.icon className="h-4 w-4" />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          {/* Settings */}
          <SidebarGroup>
            <SidebarGroupLabel>{t('sidebar.groups.settings')}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {secondaryConfig.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <Link href={`/${locale}/${item.key}`} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                      <item.icon className="h-4 w-4" />
                      <span>{t(`nav.${item.key}`)}</span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-muted-foreground">
              {t('sidebar.gateway.connected')}
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 overflow-auto" id="main-content">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-6">
            <h1 className="text-lg font-semibold">{t('sidebar.header.title')}</h1>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
    </SidebarProvider>
  );
}
