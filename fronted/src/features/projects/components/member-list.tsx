import { useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { ProjectMember, Role } from '../types'
import { useTranslation } from 'react-i18next'
import '@/features/projects/i18n/register'

export function MemberList(props: {
  loading?: boolean
  members: ProjectMember[]
  onChangeRole: (memberId: string, role: Role) => void
  onRemove: (memberId: string) => void
}) {
  const { loading, members } = props
  const [q, setQ] = useState('')
  const { t } = useTranslation()

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase()
    if (!qq) return members
    return members.filter((m) => (m.name || '').toLowerCase().includes(qq) || m.userId.toLowerCase().includes(qq))
  }, [q, members])

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Input
          placeholder={t('projects.member.searchPlaceholder')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className='w-full sm:w-72'
        />
      </div>

      <div className='space-y-2'>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between rounded-lg border p-3 animate-pulse'>
                <div className='flex items-center gap-3'>
                  <div className='h-9 w-9 rounded-full bg-muted' />
                  <div className='space-y-2'>
                    <div className='h-4 w-32 rounded bg-muted' />
                    <div className='h-3 w-24 rounded bg-muted' />
                  </div>
                </div>
                <div className='h-9 w-40 rounded bg-muted' />
              </div>
            ))
          : list.map((m) => (
              <div key={m.id} className='flex items-center justify-between rounded-lg border p-3'>
                <div className='flex items-center gap-3 min-w-0'>
                  <Avatar className='h-9 w-9'>
                    {m.avatarUrl ? <AvatarImage src={m.avatarUrl} alt={m.name} /> : null}
                    <AvatarFallback>{(m.name || 'U').slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='min-w-0'>
                    <div className='font-medium truncate'>{m.name || m.userId}</div>
                    <div className='text-xs text-muted-foreground truncate'>ID: {m.userId}</div>
                  </div>
                  <Badge variant='secondary' className='ml-2 hidden sm:inline-flex'>
                    {m.role === 'OWNER'
                      ? t('projects.member.role.owner')
                      : m.role === 'ADMIN'
                      ? t('projects.member.role.admin')
                      : t('projects.member.role.member')}
                  </Badge>
                </div>

              </div>
            ))}

        {!loading && list.length === 0 && (
          <div className='border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground'>
            {t('projects.member.noMatch')}
          </div>
        )}
      </div>

    </div>
  )
}
