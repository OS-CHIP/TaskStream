import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useDebounce } from '@/hooks/use-debounce'
import { useEffect, useState } from 'react'
import type { Status } from '../types'

interface ListToolbarProps {
  q: string
  onQChange: (q: string) => void
  status: Status
  onStatusChange: (status: Status) => void
  onCreate: () => void
  onLink?: () => void
  onGraph?: () => void
  total: number
}

export function ListToolbar({ q, onQChange, status, onStatusChange, onCreate, onLink, onGraph, total }: ListToolbarProps) {
  const { t } = useTranslation()
  const [localQ, setLocalQ] = useState(q)
  const debounced = useDebounce(localQ, 300)

  useEffect(() => {
    onQChange(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <div className='mb-2 flex flex-wrap items-center justify-between gap-3'>
      <div className='space-y-1'>
        <h2 className='text-2xl font-bold tracking-tight'>{t('projects.title')}</h2>
        <p className='text-muted-foreground'>
          {typeof total === 'number' ? t('projects.list.total', { count: total }) : ''}
        </p>
      </div>
      <div className='flex items-center gap-2 w-full sm:w-auto'>
        <div className='flex gap-2 w-full sm:w-auto'>
          <Input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder={t('projects.list.searchPlaceholder')}
            className='w-[220px]'
          />
          <Select value={status} onValueChange={(v) => onStatusChange(v as Status)}>
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder={t('projects.list.status', { defaultValue: '状态' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1'>{t('projects.status.visible', { defaultValue: '可见' })}</SelectItem>
              <SelectItem value='2'>{t('projects.status.internal', { defaultValue: '不可见' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
          
          <Button onClick={onCreate}>{t('projects.list.create')}</Button>
          {onLink && (
            <Button variant='outline' onClick={onLink}>{t('projects.relation.link')}</Button>
          )}
          {onGraph && (
            <Button variant='outline' onClick={onGraph}>{t('projectGraph.entry') || '项目关系图'}</Button>
          )}
      </div>
    </div>
  )
}
