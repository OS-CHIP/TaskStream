import { Calendar, Tag, User, Clock, CalendarDays } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import type { TaskDetail } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface TaskBasicInfoProps {
  task: TaskDetail
  isInMyTasksPage?: boolean
  onTaskSelect?: (taskId: string) => void
  displayTypeName?: string
}

export function TaskBasicInfo({ task, isInMyTasksPage, onTaskSelect, displayTypeName }: TaskBasicInfoProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  const formatDate = (date: string | Date) => {
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}/${month}/${day}`
  }

  // 判断截止时间是否需要标红（小于等于当前时间，只对比年月日）
  const isDueDateHighlighted = (dueDate: string | Date) => {
    const due = new Date(dueDate)
    const now = new Date()
    
    // 只比较年月日，忽略时分秒
    const dueYMD = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return dueYMD <= nowYMD
  }

  const handleParentTaskClick = (parentTask: string | { id: string; title: string }) => {
    const parentTaskId = typeof parentTask === 'string' 
      ? parentTask 
      : parentTask.id
    
    if (isInMyTasksPage && onTaskSelect) {
      onTaskSelect(parentTaskId)
    } else {
      navigate({ to: `/tasks/${parentTaskId}` })
    }
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{t('tasks.detail.basicInfo.title')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 创建人 */}
          {task.creator && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <User className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.creator')}</p>
                <span className="text-sm text-gray-900 mt-1 block font-medium">
                  {typeof task.creator === 'object' && task.creator?.name 
                    ? task.creator.name 
                    : String(task.creator || '')}
                </span>
              </div>
            </div>
          )}

          {/* 负责人 */}
          {task.owner && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <User className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.owner')}</p>
                <span className="text-sm text-gray-900 mt-1 block font-medium">
                  {typeof task.owner === 'object' && task.owner?.name 
                    ? task.owner.name 
                    : String(task.owner || '')}
                </span>
              </div>
            </div>
          )}

          {/* 执行人 */}
          {task.assignee && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                <User className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.assignee')}</p>
                <span className="text-sm text-gray-900 mt-1 block font-medium">
                  {typeof task.assignee === 'object' && task.assignee?.name 
                    ? task.assignee.name 
                    : String(task.assignee || '')}
                </span>
              </div>
            </div>
          )}

          {/* 分配人 */}
          {(task as any).assigner && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-100">
                <User className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.assigner')}</p>
                <span className="text-sm text-gray-900 mt-1 block font-medium">
                  {typeof (task as any).assigner === 'object' && (task as any).assigner?.name
                    ? (task as any).assigner.name
                    : String((task as any).assigner || '')}
                </span>
              </div>
            </div>
          )}

          {/* 预估工时 */}
          {(task.estimatedHours !== undefined && task.estimatedHours !== null) && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <Clock className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.estimatedHours')}</p>
                <span className="text-sm text-gray-900 mt-1 block font-medium">
                  {parseInt(String(task.estimatedHours || 0), 10)}{t('tasks.detail.basicInfo.hoursUnit')}
                </span>
              </div>
            </div>
          )}

          {/* 创建时间 */}
          {task.createdAt && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                <CalendarDays className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.createdAt')}</p>
                <span className="text-sm text-gray-900 mt-1 block">
                  {formatDate(task.createdAt)}
                </span>
              </div>
            </div>
          )}

          {/* 开始时间 */}
          {task.startTime && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.startTime')}</p>
                <span className="text-sm text-gray-900 mt-1 block">
                  {formatDate(task.startTime)}
                </span>
              </div>
            </div>
          )}

          {/* 截止时间 */}
          {task.dueDate && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                <Calendar className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.dueDate')}</p>
                <span 
                  className={cn(
                    "text-sm mt-1 block",
                    isDueDateHighlighted(task.dueDate) 
                      ? 'text-red-600 font-medium text-red-600-fallback font-medium-fallback' 
                      : 'text-gray-900 text-gray-900-fallback'
                  )}
                  style={{
                    // Inline styles as fallback for older browsers
                    color: isDueDateHighlighted(task.dueDate) ? '#dc2626' : '#111827',
                    fontWeight: isDueDateHighlighted(task.dueDate) ? '500' : 'normal',
                    fontSize: '0.875rem',
                    lineHeight: '1.25rem',
                    marginTop: '0.25rem',
                    display: 'block'
                  }}
                >
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
          )}

          {/* 父任务 */}
          {task.parentTask && task.parentTask.length > 0 && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                <Tag className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.parentTask')}</p>
                <div className="mt-1 space-y-1">
                  {task.parentTask.map((parentTask, index) => (
                    <span 
                      key={index}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block transition-colors"
                      onClick={() => handleParentTaskClick(parentTask)}
                    >
                      {typeof parentTask === 'string' 
                        ? `#${parentTask}` 
                        : `${parentTask.title}`
                      }
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 任务类型 */}
          {task.type && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                <Tag className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.taskType')}</p>
                <Badge variant="outline" className="mt-1">
                  {displayTypeName || task.type}
                </Badge>
              </div>
            </div>
          )}

          {/* 更新时间 */}
          {task.updatedAt && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                <Calendar className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{t('tasks.detail.basicInfo.updatedAt')}</p>
                <span className="text-sm text-gray-900 mt-1 block">
                  {task.updatedAt ? formatDate(task.updatedAt.toISOString()) : t('tasks.detail.basicInfo.unknownTime')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 自定义字段（仅当存在至少一个有值的项时显示整个分组） */}
        {(() => {
          const raw = ((task as any).dynamicFields ?? '').trim()
          if (!raw) return null
          try {
            const parsed = JSON.parse(raw || '{}') as Record<string, any>
            const entries = Object.entries(parsed).filter(([_, field]) => {
              const v = field?.value
              if (v === null || v === undefined) return false
              if (typeof v === 'string') return v.trim().length > 0
              if (Array.isArray(v)) return v.length > 0
              if (typeof v === 'object') return Object.keys(v).length > 0
              return true
            })
            if (entries.length === 0) return null
            return (
              <div className="space-y-3">
                <h4 className="text-base font-semibold text-gray-900">自定义字段</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.map(([key, field]) => (
                    <div key={key} className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                        <Tag className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">{field?.label || key}</p>
                        <span className="text-sm text-gray-900 mt-1 block font-medium">
                          {typeof field?.value === 'string' ? field.value : String(field?.value ?? '')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          } catch {
            return null
          }
        })()}

    </div>
  )
}
