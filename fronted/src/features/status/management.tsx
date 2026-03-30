import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { StatusManager } from './components/StatusManager'
import { StatusProvider } from './components/StatusProvider'

export function StatusManagement() {
  const topNavLinks = [
    {
      title: '状态管理',
      href: '/status/manager',
      isActive: true,
      disabled: false,
    },
  ]

  return (
    <div className='flex h-screen flex-col'>
      <AppHeader>
        <TopNav links={topNavLinks} />
      </AppHeader>
      <Main fixed className='flex-1 overflow-hidden'>
        <StatusProvider>
          <div className='bg-background'>
            <StatusManager />
          </div>
        </StatusProvider>
      </Main>
    </div>
  )
}
