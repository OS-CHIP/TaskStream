import { ArrowLeft, Edit, UserCheck, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FillProgressDialog } from './fill-progress-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { TaskDetail } from '../data/schema'
import { cn } from '@/lib/utils'
import { useNavigate } from '@tanstack/react-router'
import { TaskStatus, TaskPriority, TaskStatusType } from '../data/schema'
import { TaskService } from '../services/task-service'
import { useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useTranslation } from 'react-i18next'

interface TaskHeaderProps {
  task: TaskDetail
  onEdit?: () => void
  onStatusChange?: (status: string) => void
  onPriorityChange?: (priority: string) => void
  onToggleFavorite?: () => void
  onTaskUpdate?: () => void
  className?: string
  showBackButton?: boolean
  statusUpdating?: boolean
  priorityUpdating?: boolean
  displayTypeName?: string
}

const statusColorConfig = {
  [TaskStatus.TODO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [TaskStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-200',
  [TaskStatus.DONE]: 'bg-green-100 text-green-800 border-green-200',
  [TaskStatus.CANCELED]: 'bg-red-100 text-red-800 border-red-200',
  [TaskStatus.BLOCKED]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TaskStatus.PENDING_REVIEW]: 'bg-purple-100 text-purple-800 border-purple-200',
} as const

const priorityColorConfig = {
  [TaskPriority.LOW]: 'bg-gray-100 text-gray-800 border-gray-200',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-800 border-orange-200',
} as const

const statusKeyMap: Record<TaskStatusType, 'todo' | 'inProgress' | 'done' | 'canceled' | 'blocked' | 'pendingReview'> = {
  [TaskStatus.TODO]: 'todo',
  [TaskStatus.IN_PROGRESS]: 'inProgress',
  [TaskStatus.DONE]: 'done',
  [TaskStatus.CANCELED]: 'canceled',
  [TaskStatus.BLOCKED]: 'blocked',
  [TaskStatus.PENDING_REVIEW]: 'pendingReview',
}

/**
 * 任务头部组件
 * 显示任务标题、状态、优先级等关键信息，提供编辑和操作功能
 */
export function TaskHeader({
  task,
  onEdit,
  onStatusChange,
  onPriorityChange,
  onTaskUpdate,
  className,
  showBackButton = true,
  statusUpdating = false,
  priorityUpdating = false,
  displayTypeName
}: TaskHeaderProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [projectMembers, setProjectMembers] = useState<{ label: string; value: number }[]>([])
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [transferReason, setTransferReason] = useState<string>('')

  const [transferring, setTransferring] = useState(false)
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)

  const handleBack = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const page = urlParams.get('page')
    const currentPage = page ? parseInt(page, 10) : 1
    navigate({ to: '/tasks', search: { page: currentPage } })
  }

  // 获取项目成员列表
  const fetchProjectMembers = async () => {
    try {
      setLoadingMembers(true)
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        toast.error(t('tasks.detail.transferToast.projectIdMissing'))
        return
      }
      const members = await TaskService.getProjectUsers(projectId)
      setProjectMembers(members)
    } catch (error) {
      console.error('获取项目成员失败:', error)
      toast.error(t('tasks.detail.transferToast.membersLoadFailed'))
    } finally {
      setLoadingMembers(false)
    }
  }

  // 打开转单弹窗时获取成员列表
  const handleOpenTransferDialog = () => {
    setTransferDialogOpen(true)
    fetchProjectMembers()
  }

  // 处理转单
  const handleTransfer = async () => {
    if (!selectedMember) {
      toast.error(t('tasks.detail.transferToast.fail'))
      return
    }

    if (!transferReason.trim()) {
      toast.error(t('tasks.detail.transferToast.fail'))
      return
    }

    try {
      setTransferring(true)

      // 调用转单API
      const apiParams = {
        assignee: Number(selectedMember),
        reason: transferReason.trim(),
        taskId: task.id,
        projectId: localStorage.getItem('selected_project_id')
      }

      const response = await apiClient.post<{ code: number; msg: string; data: null }>('/task/transferTask', apiParams)
      if (response.code === 500) {
        toast.error(response.msg || t('tasks.detail.transferToast.fail'))
        return
      }
      if (response.code !== 200) {
        toast.error(t('tasks.detail.transferToast.fail'))
        return
      }

      toast.success(t('tasks.detail.transferToast.success'))
      setTransferDialogOpen(false)
      setSelectedMember('')
      setTransferReason('')
      
      // 通知父组件刷新任务数据
      onTaskUpdate?.()
    } catch (error) {
      console.error('转单失败:', error)
      const msg = (error as any)?.message || t('tasks.detail.transferToast.failRetry')
      toast.error(msg)
    } finally {
      setTransferring(false)
    }
  }



  const handleStatusChange = (newStatus: string) => {
    onStatusChange?.(newStatus)
  }

  const handlePriorityChange = (newPriority: string) => {
    onPriorityChange?.(newPriority)
  }

  const statusColor = statusColorConfig[task.status as keyof typeof statusColorConfig] || statusColorConfig[TaskStatus.TODO]
  const statusLabel = t(`tasks.status.${statusKeyMap[task.status as TaskStatusType]}`)
  const priorityColor = priorityColorConfig[task.priority as keyof typeof priorityColorConfig] || priorityColorConfig[TaskPriority.MEDIUM]
  const priorityLabel =
    t(`tasks.priority.${(task.priority as string).toLowerCase()}`)

  const disableTransfer = (() => {
    let uid: any = undefined
    try {
      const cache = localStorage.getItem('user_info_cache')
      uid = cache ? JSON.parse(cache)?.id : undefined
    } catch {}
    const aidRaw: any =
      typeof (task as any).assigner === 'object' && (task as any).assigner?.id
        ? (task as any).assigner.id
        : (task as any).assigner
    return uid != null && aidRaw != null && (aidRaw as any) == (uid as any)
  })()
  const isAssignerSelf = disableTransfer

  return (
    <div className={cn(
      className
    )}>
      {/* 顶部操作栏 */}
      <div className={cn(
        "flex items-center mb-4",
        showBackButton ? "justify-between" : "justify-end"
      )}>
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('navigation.taskList')}
          </Button>
        )}
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setProgressDialogOpen(true)}
          >
            <Percent className="h-4 w-4 mr-2" />
            {t('tasks.actions.fillProgress', { defaultValue: '填写进度' })}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('common.edit')}
          </Button>
        </div>
      </div>

      {/* 任务标题和标签 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-2 break-words">
              {task.title}
            </h1>
            
            {/* 标签显示区域 */}
            {(() => {
              // 处理后端返回的标签数据：可能是字符串（如 "1,2,3"）或数组
              let tagsArray: string[] = [];
              
              const tags = task.tags as string | string[] | undefined;
              console.log(task)
              if (tags) {
                if (typeof tags === 'string') {
                  // 如果是字符串，按逗号分割并过滤空字符串
                  tagsArray = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
                } else if (Array.isArray(tags)) {
                  // 如果已经是数组，直接使用并过滤空字符串
                  tagsArray = tags.filter((tag: string) => tag && tag.length > 0);
                }
              }
              
              return tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {tagsArray.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              );
            })()}
            
            <div className="flex flex-wrap items-center gap-2">
              {/* 任务ID */}
              <span className="text-sm text-muted-foreground font-mono">
                #{task.id}
              </span>
              
              {/* 任务类型 */}
              {task.type && (
                <Badge variant="outline" className="text-xs">
                  {displayTypeName || t(`tasks.types.${task.type}`, task.type)}
                </Badge>
              )}
              

            </div>
          </div>
          
          {/* 状态和优先级 */}
          <div className="flex flex-col sm:items-end gap-2">
            <div className="flex items-center gap-2">
              {/* 状态下拉菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={statusUpdating}
                    className={cn(
                      'border',
                      statusColor
                    )}
                  >
                    {statusUpdating ? t('tasks.detail.header.updating') : statusLabel}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.keys(statusColorConfig).map((status) => (
                    <DropdownMenuItem
                      key={status}
                      disabled={!isAssignerSelf && (status === TaskStatus.DONE || status === TaskStatus.CANCELED)}
                      onClick={() => {
                        if (!isAssignerSelf && (status === TaskStatus.DONE || status === TaskStatus.CANCELED)) return
                        handleStatusChange(status)
                      }}
                      className={task.status === status ? 'bg-accent' : ''}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full mr-2',
                        (statusColorConfig as any)[status].split(' ')[0]
                      )} />
                      {t(`tasks.status.${statusKeyMap[status as TaskStatusType]}`)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 优先级下拉菜单 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={priorityUpdating}
                    className={cn(
                      'border',
                      priorityColor
                    )}
                  >
                    {priorityUpdating ? t('tasks.detail.header.updating') : `${t('tasks.columns.priority')}: ${priorityLabel}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {Object.keys(priorityColorConfig).map((priority) => (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() => handlePriorityChange(priority)}
                      className={task.priority === priority ? 'bg-accent' : ''}
                    >
                      <div className={cn(
                        'w-2 h-2 rounded-full mr-2',
                        (priorityColorConfig as any)[priority].split(' ')[0]
                      )} />
                      {`${t('tasks.columns.priority')}: ${t(`tasks.priority.${(priority as string).toLowerCase()}`)}`}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* 转单按钮 */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenTransferDialog}
                disabled={disableTransfer}
                className="border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                {t('tasks.detail.header.transfer')}
              </Button>
            </div>
            

          </div>
        </div>
        

      </div>
      
      {/* 转单弹窗 */}
      <Dialog open={transferDialogOpen} onOpenChange={setTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('tasks.detail.transferDialog.title')}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="member-select">{t('tasks.detail.transferDialog.selectMember')}</Label>
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger id="member-select">
                  <SelectValue placeholder={loadingMembers ? t('tasks.detail.transferDialog.placeholderLoading') : t('tasks.detail.transferDialog.placeholderSelect')} />
                </SelectTrigger>
                <SelectContent>
                  {projectMembers.map((member) => (
                    <SelectItem key={member.value} value={member.value.toString()}>
                      {member.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-reason">{t('tasks.detail.transferDialog.reasonLabel')}</Label>
              <Textarea
                id="transfer-reason"
                placeholder={t('tasks.detail.transferDialog.reasonPlaceholder')}
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
            

          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTransferDialogOpen(false)}
              disabled={transferring}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={transferring || !selectedMember || !transferReason.trim() || loadingMembers}
            >
              {transferring ? t('tasks.detail.transferDialog.transferring') : t('tasks.detail.transferDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FillProgressDialog
        open={progressDialogOpen}
        onOpenChange={setProgressDialogOpen}
        task={task as any}
        onSuccess={() => {
          onTaskUpdate?.()
        }}
      />
    </div>
  )
}
