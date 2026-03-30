import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { GripVertical, Calendar, User } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { cn, isDueSoon } from '@/lib/utils'

import type { TaskDetail } from '../data/schema'
import { TaskStatus, TaskStatusType } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface TaskSubtasksProps {
  task: TaskDetail
  isEditable?: boolean
  onToggleSubtask?: (id: string, completed: boolean) => void
  isInMyTasksPage?: boolean
  onTaskSelect?: (taskId: string) => void
}

export function TaskSubtasks({ 
  task,
  isEditable = false,
  onToggleSubtask,
  isInMyTasksPage,
  onTaskSelect
}: TaskSubtasksProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const subtasks = task.subtasks || []
  const completedCount = subtasks.filter(subtask => subtask.completed).length
  const totalCount = subtasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const statusKeyMap: Record<TaskStatusType, 'todo' | 'inProgress' | 'done' | 'canceled' | 'blocked' | 'pendingReview'> = {
    [TaskStatus.TODO]: 'todo',
    [TaskStatus.IN_PROGRESS]: 'inProgress',
    [TaskStatus.DONE]: 'done',
    [TaskStatus.CANCELED]: 'canceled',
    [TaskStatus.BLOCKED]: 'blocked',
    [TaskStatus.PENDING_REVIEW]: 'pendingReview',
  }

  const handleSubtaskClick = (subtaskId: string) => {
    if (isInMyTasksPage && onTaskSelect) {
      onTaskSelect(subtaskId)
    } else {
      navigate({ to: `/tasks/${subtaskId}` })
    }
  }



  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">{t('tasks.detail.subtasks.title')}</h3>
            {totalCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {completedCount}/{totalCount}
              </Badge>
            )}
          </div>
        </div>

        {/* 进度条 */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('tasks.detail.subtasks.progress')}</span>
              <span className="text-gray-900 font-medium">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* 子任务列表 */}
        <div className="space-y-2">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                subtask.completed 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* 拖拽手柄 */}
              <div className="cursor-move text-gray-400 hover:text-gray-600">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* 复选框 */}
              <Checkbox
                checked={subtask.completed}
                onCheckedChange={(checked) => 
                  onToggleSubtask?.(subtask.id, checked as boolean)
                }
                disabled={!isEditable}
              />

              {/* 标题和详细信息 */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span 
                    className={`text-sm font-medium cursor-pointer hover:text-blue-600 transition-colors ${
                      subtask.completed 
                        ? 'text-gray-500 line-through hover:text-blue-400' 
                        : 'text-gray-900'
                    }`}
                    onClick={() => handleSubtaskClick(subtask.id)}
                  >
                    {subtask.title}
                  </span>
                  
                  {/* 状态标签 */}
                  <Badge 
                    variant={subtask.status === TaskStatus.DONE ? 'default' : 
                            subtask.status === TaskStatus.IN_PROGRESS ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {t(`tasks.status.${statusKeyMap[subtask.status as TaskStatusType]}`)}
                  </Badge>
                </div>
                
                {/* 负责人和截止日期 */}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {subtask.assignee && (
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{t('tasks.detail.parentTasks.assigneeLabel')}: {subtask.assignee}</span>
                    </div>
                  )}
                  {subtask.dueDate && (
                    <div 
                      className={cn(
                        "flex items-center space-x-1",
                        isDueSoon(subtask.dueDate) ? "text-red-600 font-bold text-red-600-fallback font-bold-fallback" : ""
                      )}
                      style={{
                        // Inline styles as fallback for older browsers
                        color: isDueSoon(subtask.dueDate) ? '#dc2626' : 'inherit',
                        fontWeight: isDueSoon(subtask.dueDate) ? 'bold' : 'normal'
                      }}
                    >
                      <Calendar className="w-3 h-3" />
                      <span>{t('tasks.detail.parentTasks.dueLabel')}: {subtask.dueDate.getFullYear()}/{String(subtask.dueDate.getMonth() + 1).padStart(2, '0')}/{String(subtask.dueDate.getDate()).padStart(2, '0')}</span>
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
            <p className="text-gray-500 mb-3">{t('tasks.detail.subtasks.empty')}</p>
          </div>
        )}
    </div>
  )
}
