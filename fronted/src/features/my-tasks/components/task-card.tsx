import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Task } from '../../tasks/data/schema'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Calendar, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { TaskService, getTaskTypeStringFromId } from '@/features/tasks/services/task-service'

interface TaskCardProps {
  task: Task
  isSelected: boolean
  onClick: (taskId: string) => void
  className?: string
}

// 优先级颜色映射
const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  urgent: 'bg-red-100 text-red-800 border-red-200',
} as const

// 状态颜色映射
const statusColors = {
  '1': 'bg-gray-100 text-gray-800 border-gray-200',
  '2': 'bg-blue-100 text-blue-800 border-blue-200',
  '3': 'bg-green-100 text-green-800 border-green-200',
  '4': 'bg-red-100 text-red-800 border-red-200',
} as const

// 优先级文本映射
const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
} as const

// 状态文本映射
const statusLabels = {
  '1': '待开始',
  '2': '进行中',
  '3': '已完成',
  '4': '已取消',
} as const

export default React.memo(function TaskCard({
  task,
  isSelected,
  onClick,
  className
}: TaskCardProps) {
  const [typeLabel, setTypeLabel] = useState<string>('')
  useEffect(() => {
    let mounted = true
    TaskService.getTaskOptions()
      .then((opts: { types: { label: string; value: string }[] }) => {
        if (!mounted) return
        const map: Record<string, string> = {}
        for (const t of opts.types) {
          map[String(t.value)] = String(t.label)
        }
        const typeId = String(task.type || '')
        let label = map[typeId]
        if (!label && typeId) {
          const isNumeric = /^\d+$/.test(typeId)
          if (isNumeric) {
            const key = getTaskTypeStringFromId(Number(typeId))
            label = key
          } else {
            label = typeId
          }
        }
        setTypeLabel(label || '')
      })
      .catch(() => {
        const typeId = String(task.type || '')
        const isNumeric = /^\d+$/.test(typeId)
        if (isNumeric) {
          setTypeLabel(getTaskTypeStringFromId(Number(typeId)))
        } else {
          setTypeLabel(typeId)
        }
      })
    return () => {
      mounted = false
    }
  }, [task.type])
  // 判断截止时间是否需要标红（小于等于当前时间，只对比年月日）
  const isDueDateHighlighted = (dueDate: string | Date) => {
    const due = new Date(dueDate)
    const now = new Date()
    
    // 只比较年月日，忽略时分秒
    const dueYMD = new Date(due.getFullYear(), due.getMonth(), due.getDate())
    const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    return dueYMD <= nowYMD
  }

  const handleClick = () => {
    onClick(task.id)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick(task.id)
    }
  }

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        'border-2 hover:border-primary/20',
        isSelected && 'border-primary selected-task-bg shadow-md',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      <CardContent className="p-3">
        {/* 任务ID和标题 */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">#{task.id}</span>
            {typeLabel && typeLabel.toLowerCase() !== 'default' && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 h-5">
                {typeLabel}
              </Badge>
            )}
            {task.label && String(task.label).toLowerCase() !== 'default' && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5">
                {task.label}
              </Badge>
            )}
          </div>
          <h3 className={cn(
            'font-medium text-sm line-clamp-2 leading-5',
            isSelected && 'text-primary'
          )}>
            {task.title}
          </h3>
        </div>

        {/* 任务描述 */}
        {task.description && (
          <div className="mb-2">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-4">
              {task.description}
            </p>
          </div>
        )}

        {/* 状态和优先级标签 */}
        <div className="flex items-center gap-2 mb-2">
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs px-2 py-0.5 h-5',
              statusColors[task.status as keyof typeof statusColors] || statusColors['1']
            )}
          >
            {statusLabels[task.status as keyof typeof statusLabels] || task.status}
          </Badge>
          
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs px-2 py-0.5 h-5',
              priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
            )}
          >
            {priorityLabels[task.priority as keyof typeof priorityLabels] || task.priority}
          </Badge>
        </div>

        {/* 底部信息 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* 负责人 */}
          {task.assignee && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-20">
                {typeof task.assignee === 'object' && task.assignee?.name 
                  ? task.assignee.name 
                  : String(task.assignee || '')}
              </span>
            </div>
          )}
          
          {/* 截止日期 */}
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span 
                className={cn(
                  isDueDateHighlighted(task.dueDate) 
                    ? 'text-red-600 font-medium text-red-600-fallback font-medium-fallback' 
                    : ''
                )}
                style={{
                  // Inline styles as fallback for older browsers
                  color: isDueDateHighlighted(task.dueDate) ? '#dc2626' : 'inherit',
                  fontWeight: isDueDateHighlighted(task.dueDate) ? '500' : 'normal'
                }}
              >
                {format(new Date(task.dueDate), 'MM/dd', { locale: zhCN })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
})
