import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/features/tasks/data/schema'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Clock, User, AlertCircle, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isAfter } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { DropZone } from './drop-indicator'
import { useEffect, useState } from 'react'
import { TaskService, getTaskTypeStringFromId } from '@/features/tasks/services/task-service'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

interface KanbanCardProps {
  task: Task
  insertPosition?: { taskId: string; position: 'top' | 'bottom' } | null
}

// 优先级颜色映射
const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  urgent: 'bg-purple-100 text-purple-800 border-purple-200'
}

// 优先级翻译映射
const priorityLabels = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急'
}

// 优先级文本颜色映射
// const priorityTextColors = {
//   low: 'text-green-600',
//   medium: 'text-yellow-600',
//   high: 'text-red-600',
//   urgent: 'text-purple-600'
// }

// 标签颜色映射
const labelColors = {
  bug: 'bg-red-100 text-red-800',
  feature: 'bg-blue-100 text-blue-800',
  enhancement: 'bg-purple-100 text-purple-800',
  documentation: 'bg-green-100 text-green-800'
}

export function KanbanCard({ task, insertPosition }: KanbanCardProps) {
  const [typeLabel, setTypeLabel] = useState<string>('')
  const [assigneeName, setAssigneeName] = useState<string>('')
  const navigate = useNavigate()
  useEffect(() => {
    let mounted = true
    TaskService.getTaskOptions()
      .then((opts: { types: { label: string; value: string }[]; assignees: { label: string; value: number }[] }) => {
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
        let name = ''
        const assigneeId = typeof task.assignee === 'number' ? task.assignee : undefined
        if (assigneeId !== undefined && Array.isArray(opts.assignees)) {
          const matched = opts.assignees.find(a => Number(a.value) === Number(assigneeId))
          if (matched) {
            name = matched.label
          }
        }
        if (!name && typeof task.assignee === 'object' && (task.assignee as any)?.name) {
          name = String((task.assignee as any).name)
        }
        setAssigneeName(name)
      })
      .catch(() => {
        const typeId = String(task.type || '')
        const isNumeric = /^\d+$/.test(typeId)
        if (isNumeric) {
          setTypeLabel(getTaskTypeStringFromId(Number(typeId)))
        } else {
          setTypeLabel(typeId)
        }
        let name = ''
        if (typeof task.assignee === 'object' && (task.assignee as any)?.name) {
          name = String((task.assignee as any).name)
        }
        setAssigneeName(name)
      })
    return () => {
      mounted = false
    }
  }, [task.type, task.assignee])
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // 判断是否逾期
  const isOverdue = task.dueDate && isAfter(new Date(), new Date(task.dueDate))
  
  // 检查是否有插入指示器
  const isInsertTarget = insertPosition?.taskId === task.id
  const insertPos = isInsertTarget ? insertPosition.position : null



  return (
    <DropZone 
      isOver={isInsertTarget} 
      insertPosition={insertPos}
      className="transition-all duration-300 ease-in-out"
    >
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}

        className={cn(
          'cursor-move transition-all duration-300 ease-in-out shadow-md hover:shadow-xl hover:scale-[1.02]',
          'border-2 border-transparent hover:border-primary/20',
          'transform-gpu', // 启用GPU加速
          isDragging && 'opacity-0 scale-95 shadow-2xl', // 拖拽时原位置卡片变透明缩小，增强阴影
          isInsertTarget && 'ring-2 ring-primary/50 shadow-2xl' // 插入目标高亮，增强阴影
        )}
      >
      <CardContent className="px-2 pt-2 pb-0.5 space-y-3">
        {/* 标题和优先级 */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-sm font-medium line-clamp-2 flex-1">
            {task.title}
          </h4>
          {task.priority && (
            <Badge
            variant="outline"
            className={cn('text-xs shrink-0', priorityColors[task.priority])}
          >
              {priorityLabels[task.priority] || task.priority}
            </Badge>
          )}
        </div>
        
        {/* 类型与标签 */}
        {(typeLabel || task.label) && (
          <div className="flex flex-wrap gap-1">
            {typeLabel && typeLabel.toLowerCase() !== 'default' && (
              <Badge variant="outline" className="text-xs">
                {typeLabel}
              </Badge>
            )}
            {task.label && String(task.label).toLowerCase() !== 'default' && (
              <Badge
                variant="secondary"
                className={cn('text-xs', labelColors[task.label as keyof typeof labelColors])}
              >
                {task.label}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-muted-foreground" />
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-xs">
              {(assigneeName || String(task.assignee || '')).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {assigneeName || (typeof task.assignee === 'object' && (task.assignee as any)?.name) || (task.assignee ? String(task.assignee) : '未分配')}
          </span>
        </div>

        {/* 截止日期 */}
        {task.dueDate && (
          <div className={cn(
            'flex items-center gap-2 text-xs',
            isOverdue ? 'text-red-600' : 'text-muted-foreground'
          )}>
            <span>截止日期:</span>
            <Calendar className="h-3 w-3" />
            <span>
              {format(new Date(task.dueDate), 'MM/dd', { locale: zhCN })}
            </span>
            {isOverdue && (
              <AlertCircle className="h-3 w-3 text-red-600" />
            )}
          </div>
        )}

        {/* 任务ID和预估工时 */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>任务编号: {task.taskCode || `#${task.id}`}</span>
          {task.estimatedHours && (
            <div className="flex items-center gap-1">
              <span>工时:</span>
              <Clock className="h-3 w-3" />
              <span>{parseInt(String(task.estimatedHours), 10)}h</span>
            </div>
          )}
        </div>
        {/* 查看按钮单独一行，右下角 */}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate({ to: `/tasks/${task.id}` })
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="h-7 px-3"
          >
            <Eye className="h-3 w-3 mr-1" />
            查看
          </Button>
        </div>
      </CardContent>
      </Card>
    </DropZone>
  )
}
