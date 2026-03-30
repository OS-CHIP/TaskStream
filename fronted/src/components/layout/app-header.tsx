import { ReactNode } from 'react'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Link } from '@tanstack/react-router'
import logoUrl from '@/assets/logo.svg'
import { NotificationBell } from '@/components/notification-bell'

interface AppHeaderProps {
  children?: ReactNode
  showBrand?: boolean
  fixed?: boolean
}

export function AppHeader({ children, showBrand = true, fixed }: AppHeaderProps) {
  return (
    <Header fixed={fixed}>
      {showBrand && (
        <Link to='/' className='flex items-center gap-2 hover:opacity-90'>
          <img src={logoUrl} alt='Logo' className='h-6 w-6' />
          <span className='hidden sm:inline font-semibold tracking-tight'>Task Stream</span>
        </Link>
      )}
      {children}
      <div className='ml-auto flex items-center space-x-4'>
        <Search />
        <LanguageSwitch />
        <ThemeSwitch />
        <NotificationBell />
        <ProfileDropdown />
      </div>
    </Header>
  )
}
