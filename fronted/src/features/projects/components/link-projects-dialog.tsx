import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { SelectDropdown } from '@/components/select-dropdown'
import { projectsService } from '../services/projects.service'
import type { Project } from '../types'
import { useTranslation } from 'react-i18next'
import '@/features/projects/i18n/register'

export function LinkProjectsDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm?: (parentId: string, childId: string) => void
  initialChildId?: string
}) {
  const { open, onOpenChange, onConfirm, initialChildId } = props
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [parentId, setParentId] = useState<string>('')
  const [childId, setChildId] = useState<string>('')

  useEffect(() => {
    if (!open) return
    let alive = true
    setLoading(true)
    projectsService
      .list({ page: 1, pageSize: 9999, status: '1' })
      .then((res) => {
        if (!alive) return
        setProjects(res.items)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [open])

  useEffect(() => {
    if (open && initialChildId) {
      setChildId(initialChildId)
    }
  }, [open, initialChildId])

  const items = useMemo(
    () =>
      projects.map((p) => ({
        label: p.name,
        value: p.id,
      })),
    [projects],
  )

  const childProject = useMemo(() => projects.find(p => p.id === childId) || null, [projects, childId])
  const parentItems = useMemo(() => items.filter(i => i.value !== childId), [items, childId])

  const disabled = !parentId || !childId || parentId === childId

  const handleConfirm = () => {
    if (disabled) return
    onConfirm?.(parentId, childId)
    onOpenChange(false)
    setParentId('')
    setChildId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('projects.relation.title')}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <div className='grid gap-2'>
            <label className='text-sm font-medium'>{t('projects.relation.child')}</label>
            <div className='rounded border px-2 py-1 text-sm'>
              {childProject ? `${childProject.name}（ID: ${childProject.id}）` : initialChildId || ''}
            </div>
          </div>

          <div className='grid gap-2'>
            <label className='text-sm font-medium'>{t('projects.relation.parent')}</label>
            <SelectDropdown
              isControlled
              value={parentId}
              onValueChange={setParentId}
              isPending={loading}
              items={parentItems}
              placeholder={t('projects.relation.parentPlaceholder')}
              embedFormControl={false}
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              {t('projects.relation.cancel')}
            </Button>
            <Button onClick={handleConfirm} disabled={disabled}>
              {t('projects.relation.confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
