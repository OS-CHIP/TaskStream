import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { Row } from '@tanstack/react-table'
import { IconTrash, IconEye, IconPlayerPlay, IconCheck, IconX } from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTasks } from '../context/tasks-context'
import { taskSchema, TaskStatus } from '../data/schema'
import { getTaskDetailBasic } from '../services/task-detail-service'
import type { TaskDetail } from '../data/schema'
import { projectsService } from '../../projects/services/projects.service'
import { toast } from 'sonner'

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = taskSchema.parse(row.original)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/tasks/' })
  const currentPage = search.page || 1
  const [oaOpen, setOaOpen] = useState(false)
  const [oaLoading, setOaLoading] = useState(false)
  const [oaDetail, setOaDetail] = useState<TaskDetail | null>(null)

  const { setOpen, setCurrentRow, updateTaskStatus, fetchTasks } = useTasks()

  const handleViewTask = () => {
    navigate({ to: `/tasks/${task.id}`, search: { page: currentPage } })
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus(task.id, newStatus)
    } catch (error) {
      console.error('更新任务状态失败:', error)
    }
  }

  const getAvailableActions = () => {
    const actions = []
    
    // 根据当前状态显示可用的操作
    switch (task.status) {
      case TaskStatus.TODO:
        actions.push({
          label: t('tasks.actions.start'),
          icon: IconPlayerPlay,
          action: () => handleStatusChange(TaskStatus.IN_PROGRESS),
        })
        actions.push({
          label: t('tasks.actions.cancel'),
          icon: IconX,
          action: () => handleStatusChange(TaskStatus.CANCELED),
        })
        break
      case TaskStatus.IN_PROGRESS:
        actions.push({
          label: t('tasks.actions.pendingReview') || '待review',
          icon: IconEye,
          action: () => handleStatusChange(TaskStatus.PENDING_REVIEW),
        })
        actions.push({
          label: t('tasks.actions.complete'),
          icon: IconCheck,
          action: () => handleStatusChange(TaskStatus.DONE),
        })
        actions.push({
          label: t('tasks.actions.block'),
          icon: IconX,
          action: () => handleStatusChange(TaskStatus.BLOCKED),
        })
        actions.push({
          label: t('tasks.actions.cancel'),
          icon: IconX,
          action: () => handleStatusChange(TaskStatus.CANCELED),
        })
        break
      case TaskStatus.PENDING_REVIEW:
        actions.push({
          label: t('tasks.actions.complete'),
          icon: IconCheck,
          action: () => handleStatusChange(TaskStatus.DONE),
        })
        actions.push({
          label: t('tasks.actions.restart') || '重新开始',
          icon: IconPlayerPlay,
          action: () => handleStatusChange(TaskStatus.IN_PROGRESS),
        })
        break
      case TaskStatus.DONE:
        // 已完成的任务可以重新开始
        actions.push({
          label: t('tasks.actions.restart'),
          icon: IconPlayerPlay,
          action: () => handleStatusChange(TaskStatus.IN_PROGRESS),
        })
        break
      case TaskStatus.BLOCKED:
        // 已阻塞的任务可以继续或取消
        actions.push({
          label: t('tasks.actions.continue'),
          icon: IconPlayerPlay,
          action: () => handleStatusChange(TaskStatus.IN_PROGRESS),
        })
        actions.push({
          label: t('tasks.actions.cancel'),
          icon: IconX,
          action: () => handleStatusChange(TaskStatus.CANCELED),
        })
        break
      case TaskStatus.CANCELED:
        // 已取消的任务可以重新开始
        actions.push({
          label: t('tasks.actions.restart'),
          icon: IconPlayerPlay,
          action: () => handleStatusChange(TaskStatus.TODO),
        })
        break
    }
    
    return actions
  }

  const availableActions = getAvailableActions()
  const handleFillProgress = () => {
    setCurrentRow(task)
    setOpen('progress')
  }

  return (
    <div className='flex items-center gap-2'>
      {Number((task as any).type) === 1 ? (
        <>
        <Button
          variant='outline'
          className='h-8 px-2'
          onClick={async () => {
            setOaOpen(true)
            setOaLoading(true)
            try {
              const detail = await getTaskDetailBasic(task.id.toString())
              setOaDetail(detail)
            } catch (e) {
              console.error('获取任务详情失败:', e)
            } finally {
              setOaLoading(false)
            }
          }}
        >
          {t('tasks.actions.view')}
        </Button>
        <Dialog
          open={oaOpen}
          onOpenChange={(open) => {
            setOaOpen(open)
            if (!open) {
              setOaDetail(null)
              setOaLoading(false)
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('oa.title', { defaultValue: 'OA工单' })}</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <div className='space-y-3'>
              {oaLoading ? (
                <div className='text-sm text-slate-600'>{t('common.loading', { defaultValue: '加载中...' })}</div>
              ) : (
                <>
                  <div className='text-sm text-slate-600'>
                    <span className='font-medium text-slate-900'>{t('oa.orderTitle', { defaultValue: '工单标题' })}：</span>
                    <span>{oaDetail?.title || (task as any).title}</span>
                  </div>
                  <div className='text-sm text-slate-600'>
                    <span className='font-medium text-slate-900'>{t('oa.description', { defaultValue: '介绍' })}：</span>
                    <span>{oaDetail?.description || (task as any).description || t('oa.noDescription', { defaultValue: '暂无介绍' })}</span>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                variant='secondary'
                className='h-8 px-3'
                disabled={String((oaDetail as any)?.rawStatus ?? '').trim() !== '100'}
                onClick={async () => {
                  try {
                    const df = (oaDetail as any)?.dynamicFields
                    let parsed: any = null
                    if (df && typeof df === 'string') {
                      try { parsed = JSON.parse(df) } catch {}
                    } else if (df && typeof df === 'object') {
                      parsed = df
                    }
                    const getVal = (key: string) => {
                      const item = parsed?.[key]
                      const v = item?.value
                      return v === undefined || v === null ? undefined : v
                    }
                    const projectDescriptionRaw = getVal('projectDescription')
                    const projectDescription = typeof projectDescriptionRaw === 'string'
                      ? projectDescriptionRaw
                      : (projectDescriptionRaw != null ? String(projectDescriptionRaw) : '')
                    const projectParentIdRaw = localStorage.getItem('selected_project_id') ?? '0'
                    const projectParentId = typeof projectParentIdRaw === 'number' ? projectParentIdRaw : String(projectParentIdRaw || '0')
                    const projectSubIdRaw = getVal('projectSubId')
                    const projectSubId = projectSubIdRaw === undefined || projectSubIdRaw === null || projectSubIdRaw === '' ? undefined : (typeof projectSubIdRaw === 'number' ? projectSubIdRaw : String(projectSubIdRaw))
                    const projectNameRaw = oaDetail?.title ?? (task as any)?.title ?? ''
                    const projectName = typeof projectNameRaw === 'string' ? projectNameRaw : String(projectNameRaw || '')
                    let ownerVal = getVal('owner')
                    if (ownerVal === undefined || ownerVal === null || ownerVal === '') {
                      const o = (oaDetail as any)?.owner
                      if (o && typeof o === 'object' && o.id) {
                        ownerVal = typeof o.id === 'string' ? o.id : String(o.id)
                      } else if (typeof o === 'number') {
                        ownerVal = String(o)
                      } else if (typeof o === 'string' && o.trim()) {
                        ownerVal = o.trim()
                      } else {
                        try {
                          const cached = localStorage.getItem('user_info_cache')
                          if (cached) {
                            const cu = JSON.parse(cached)
                            if (cu?.id) ownerVal = String(cu.id)
                          }
                        } catch {}
                      }
                    }
                    await projectsService.agreeCreateSubProject({
                      projectDescription,
                      projectParentId,
                      projectSubId,
                      projectName,
                      owner: ownerVal as any,
                      taskId: (oaDetail?.id ?? task.id)
                    })
                    toast.success(t('oa.approved', { defaultValue: '已同意OA工单' }))
                    await fetchTasks()
                  } catch (error) {
                    toast.error(t('oa.approveFailed', { defaultValue: '同意失败' }))
                  } finally {
                    setOaOpen(false)
                  }
                }}
              >
                {t('oa.approve', { defaultValue: '同意' })}
              </Button>
              <Button
                variant='destructive'
                className='h-8 px-3'
                disabled={String((oaDetail as any)?.rawStatus ?? '').trim() !== '100'}
                onClick={() => {
                  handleStatusChange(TaskStatus.CANCELED)
                  setOaOpen(false)
                }}
              >
                {t('oa.reject', { defaultValue: '拒绝' })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </>
      ) : (
        <>
          <Button variant='outline' className='h-8 px-2' onClick={handleFillProgress}>
            {t('tasks.actions.fillProgress') || '填写进度'}
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
              >
                <DotsHorizontalIcon className='h-4 w-4' />
                <span className='sr-only'>{t('tasks.actions.openMenu')}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-[160px]'>
              <DropdownMenuItem onClick={handleViewTask}>
                {t('tasks.actions.view')}
                <DropdownMenuShortcut>
                  <IconEye size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigate({ to: '/tasks/create', search: { editId: task.id } })
                }}
              >
                {t('tasks.actions.edit')}
              </DropdownMenuItem>
              
              {availableActions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {availableActions.map((action, index) => (
                    <DropdownMenuItem key={index} onClick={action.action}>
                      {action.label}
                      <DropdownMenuShortcut>
                        <action.icon size={16} />
                      </DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(task)
                  setOpen('delete')
                }}
              >
                {t('tasks.actions.delete')}
                <DropdownMenuShortcut>
                  <IconTrash size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  )
}
