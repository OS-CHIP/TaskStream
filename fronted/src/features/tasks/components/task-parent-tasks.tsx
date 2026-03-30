import { Badge } from '@/components/ui/badge'
import { Calendar, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn, isDueSoon } from '@/lib/utils'

import type { TaskDetail } from '../data/schema'
import { TaskStatus, TaskStatusType } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface TaskParentTasksProps {
  task: TaskDetail
  isInMyTasksPage?: boolean
  onTaskSelect?: (taskId: string) => void
}

export function TaskParentTasks({ 
  task,
  isInMyTasksPage,
  onTaskSelect
}: TaskParentTasksProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const parentTasks = task.parentTasks || []
  const totalCount = parentTasks.length
  const statusKeyMap: Record<TaskStatusType, 'todo' | 'inProgress' | 'done' | 'canceled' | 'blocked' | 'pendingReview'> = {
    [TaskStatus.TODO]: 'todo',
    [TaskStatus.IN_PROGRESS]: 'inProgress',
    [TaskStatus.DONE]: 'done',
    [TaskStatus.CANCELED]: 'canceled',
    [TaskStatus.BLOCKED]: 'blocked',
    [TaskStatus.PENDING_REVIEW]: 'pendingReview',
  }

  const handleParentTaskClick = (parentTaskId: string) => {
    if (isInMyTasksPage && onTaskSelect) {
      onTaskSelect(parentTaskId)
    } else {
      navigate({ to: `/tasks/${parentTaskId}` })
    }
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{t('tasks.detail.parentTasks.title')}</h3>
            {totalCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalCount}
              </Badge>
            )}
          </div>
        </div>

        {/* 父任务列表 */}
        <div className="space-y-2">
          {parentTasks.map((parentTask) => (
            <div
              key={parentTask.id}
              className="flex items-center space-x-3 p-3 rounded-lg border bg-white border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* 标题和详细信息 */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors text-gray-900"
                    onClick={() => handleParentTaskClick(parentTask.id)}
                  >
                    {parentTask.title}
                  </span>
                  
                  {/* 状态标签 */}
                  <Badge 
                    variant={parentTask.status === TaskStatus.DONE ? 'default' : 
                            parentTask.status === TaskStatus.IN_PROGRESS ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {t(`tasks.status.${statusKeyMap[parentTask.status as TaskStatusType]}`)}
                  </Badge>
                </div>
                
                {/* 负责人和截止日期 */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {parentTask.assignee && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{t('tasks.detail.parentTasks.assigneeLabel')}: {parentTask.assignee}</span>
                    </div>
                  )}
                  {parentTask.dueDate && (
                    <div 
                      className={cn(
                        "flex items-center space-x-1",
                        isDueSoon(parentTask.dueDate) ? "text-red-600 font-bold text-red-600-fallback font-bold-fallback" : ""
                      )}
                      style={{
                        // Inline styles as fallback for older browsers
                        color: isDueSoon(parentTask.dueDate) ? '#dc2626' : 'inherit',
                        fontWeight: isDueSoon(parentTask.dueDate) ? 'bold' : 'normal'
                      }}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{t('tasks.detail.parentTasks.dueLabel')}: {parentTask.dueDate.getFullYear()}/{String(parentTask.dueDate.getMonth() + 1).padStart(2, '0')}/{String(parentTask.dueDate.getDate()).padStart(2, '0')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {totalCount === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-3">{t('tasks.detail.parentTasks.empty')}</p>
          </div>
        )}
    </div>
  )
}
