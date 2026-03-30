import { Outlet } from '@tanstack/react-router'
import {
  IconBrowserCheck,
  IconNotification,
  IconPalette,
  IconTool,
  IconUser,
  IconKey,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { Separator } from '@/components/ui/separator'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notification-bell'
import SidebarNav from './components/sidebar-nav'

export default function Settings() {
  const { t } = useTranslation()
  const sidebarNavItems = getSidebarNavItems(t)

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>

      <Main fixed>
        <div className='space-y-0.5'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            {t('settings.title')}
          </h1>
          <p className='text-muted-foreground'>{t('settings.description')}</p>
        </div>
        <Separator className='my-4 lg:my-6' />
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

const getSidebarNavItems = (t: (key: string, options?: Record<string, unknown>) => string) => [
  {
    title: t('settings.profile'),
    icon: <IconUser size={18} />,
    href: '/settings',
  },
  {
    title: t('settings.account'),
    icon: <IconTool size={18} />,
    href: '/settings/account',
  },
  {
    title: t('settings.password.menu', { defaultValue: 'Change Password' }),
    icon: <IconKey size={18} />,
    href: '/settings/password',
  },
  {
    title: t('settings.appearance'),
    icon: <IconPalette size={18} />,
    href: '/settings/appearance',
  },
  {
    title: t('settings.notifications'),
    icon: <IconNotification size={18} />,
    href: '/settings/notifications',
  },
  {
    title: t('settings.display'),
    icon: <IconBrowserCheck size={18} />,
    href: '/settings/display',
  },
]
