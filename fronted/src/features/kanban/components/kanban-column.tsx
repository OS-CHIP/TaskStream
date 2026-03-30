import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KanbanCard } from './kanban-card'
import { Task } from '@/features/tasks/data/schema'
import { cn } from '@/lib/utils'
import { Clock, Zap, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react'

interface KanbanColumnProps {
  title: string
  status: string
  tasks: Task[]
  insertPosition?: { taskId: string; position: 'top' | 'bottom' } | null
  onToggleSort?: (columnId: string, sortType: 'deadline' | 'priority') => void
  getColumnSortState?: (columnId: string) => { deadline: 'none' | 'asc' | 'desc'; priority: 'none' | 'asc' | 'desc' }
}

// 状态颜色映射
const statusColors = {
  todo: 'bg-gray-100 text-gray-800 border-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'in-review': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  done: 'bg-green-100 text-green-800 border-green-200'
}

/**
 * 看板列组件
 * 显示特定状态的任务列表，支持拖拽放置
 */
export function KanbanColumn({
  title,
  status,
  tasks,
  insertPosition,
  onToggleSort,
  getColumnSortState
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status
    }
  })

  const taskIds = tasks.map(task => task.id)

  const sortState = getColumnSortState ? getColumnSortState(status) : { deadline: 'none' as const, priority: 'none' as const }

  const handleToggleDeadlineSort = () => {
    onToggleSort?.(status, 'deadline')
  }

  const handleTogglePrioritySort = () => {
    onToggleSort?.(status, 'priority')
  }

  const getDeadlineSortIcon = () => {
    switch (sortState.deadline) {
      case 'asc':
        return <ArrowUp className="h-3 w-3" />
      case 'desc':
        return <ArrowDown className="h-3 w-3" />
      default:
        return <ArrowUpDown className="h-3 w-3" />
    }
  }

  const getPrioritySortIcon = () => {
    switch (sortState.priority) {
      case 'asc':
        return <ArrowUp className="h-3 w-3" />
      case 'desc':
        return <ArrowDown className="h-3 w-3" />
      default:
        return <ArrowUpDown className="h-3 w-3" />
    }
  }

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'flex flex-col h-full min-w-80 max-w-80 transition-all duration-300 ease-in-out',
        'border-2 border-border',
        isOver && 'ring-2 ring-primary ring-offset-2 bg-primary/10 border-primary/50 shadow-lg scale-[1.02]'
      )}
    >
      {/* 固定头部 */}
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Badge
            variant="secondary"
            className={cn('text-xs', statusColors[status as keyof typeof statusColors])}
          >
            {tasks.length}
          </Badge>
        </div>
        
        {/* 排序按钮 */}
        {(onToggleSort && getColumnSortState) && (
          <div className="flex items-center gap-1 mt-2">
            {/* 截止时间排序 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleDeadlineSort}
              className={cn(
                "h-6 px-2 text-xs",
                sortState.deadline !== 'none' && "bg-blue-50 text-blue-600"
              )}
              title={`截止时间排序: ${sortState.deadline === 'none' ? '无' : sortState.deadline === 'asc' ? '升序' : '降序'}`}
            >
              <Clock className="h-3 w-3 mr-1" />
              {getDeadlineSortIcon()}
            </Button>
            
            {/* 优先级排序 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleTogglePrioritySort}
              className={cn(
                "h-6 px-2 text-xs",
                sortState.priority !== 'none' && "bg-orange-50 text-orange-600"
              )}
              title={`优先级排序: ${sortState.priority === 'none' ? '无' : sortState.priority === 'asc' ? '低到高' : '高到低'}`}
            >
              <Zap className="h-3 w-3 mr-1" />
              {getPrioritySortIcon()}
            </Button>
          </div>
        )}
      </CardHeader>

      {/* 可滚动的卡片容器 */}
      <CardContent className="flex-1 pt-0 pb-4 min-h-0 flex flex-col">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-4">
            <div className="space-y-4 py-2">
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  insertPosition={insertPosition}
                />
              ))}
              
              {/* 空状态 */}
              {tasks.length === 0 && (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    <div className="text-sm">暂无任务</div>
                    <div className="text-xs mt-1">拖拽任务到此处</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}