import { createFileRoute } from '@tanstack/react-router'
import { SendNoticeForm } from '@/features/notifications/components/send-notice-form'
import { Header } from '@/components/layout/header'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

export const Route = createFileRoute('/_authenticated/send-notice')({
  component: SendNoticePage,
})

function SendNoticePage() {
  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <div className='container mx-auto py-10 pt-20'>
        <SendNoticeForm />
      </div>
    </>
  )
}

