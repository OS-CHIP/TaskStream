import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { IconBell } from '@tabler/icons-react'
import { noticeService } from '@/features/notifications/services/notice-service'
import { useTranslation } from 'react-i18next'

export function NotificationBell() {
  const [unread, setUnread] = useState<number>(0)
  const { t } = useTranslation()

  useEffect(() => {
    let mounted = true
    const refreshInit = async () => {
      try {
        const data = await noticeService.unreadCountInitOnce()
        if (mounted) setUnread(data.total || 0)
      } catch {}
    }
    refreshInit()
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { unreadCount?: number } | undefined
      const v = typeof detail?.unreadCount === 'number' ? detail.unreadCount : undefined
      if (v !== undefined) {
        noticeService.setUnreadCached(v)
        if (mounted) setUnread(v || 0)
      }
    }
    window.addEventListener('messages:update', handler)
    return () => {
      mounted = false
      window.removeEventListener('messages:update', handler)
    }
  }, [])

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to='/messages' aria-label={t('navigation.systemMessages')}>
          <Button variant='ghost' className='relative h-8 w-8 rounded-full'>
            <IconBell className='h-5 w-5' />
            {unread > 0 && (
              <span
                className='absolute -right-0.5 -top-0.5 min-w-[16px] px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center'
                aria-label={t('messages.unreadCount', { count: unread })}
              >
                {unread}
              </span>
            )}
          </Button>
        </Link>
      </TooltipTrigger>
      <TooltipContent side='bottom'>{t('navigation.systemMessages')}</TooltipContent>
    </Tooltip>
  )
}
