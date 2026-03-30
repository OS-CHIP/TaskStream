import { useMemo } from 'react'
import { DndContext, DragEndEvent, DragOverlay, defaultDropAnimationSideEffects, DropAnimation } from '@dnd-kit/core'
import { cn } from '@/lib/utils'
import { KanbanColumn } from './kanban-column'
import { KanbanCard } from './kanban-card'
import { useKanban, useDragAndDrop } from '../hooks/use-kanban'
import { TaskStatus, Task } from '@/features/tasks/data/schema'

interface KanbanBoardProps {
  className?: string
}

// 看板列配置
const COLUMNS = [
  { id: TaskStatus.TODO, title: '待开始' },
  { id: TaskStatus.IN_PROGRESS, title: '进行中' },
  { id: TaskStatus.DONE, title: '已完成' },
  { id: TaskStatus.CANCELED, title: '已取消' }
] as const

// 拖拽动画配置
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
}

/**
 * 看板主页面组件
 * 整合筛选器、看板列和拖拽功能
 */
export function KanbanBoard({ className }: KanbanBoardProps) {
  const {
    tasksByStatus,
    moveTask,
    moveTaskToPosition,
    toggleColumnSort,
    getColumnSortState,
    getSortedTasks,
    loading,
    error
  } = useKanban()

  // 确保 tasksByStatus 不为空，并安全地获取所有任务
  const allTasks = useMemo(() => {
    if (!tasksByStatus) return []
    return Object.values(tasksByStatus).flat() as Task[]
  }, [tasksByStatus])
  
  const { activeTask, insertPosition, getRotationAngle, handleDragStart, handleDragOver, handleDragEnd } = useDragAndDrop(moveTask, moveTaskToPosition, allTasks)

  const handleDragEndEvent = (event: DragEndEvent) => {
    handleDragEnd(event)
  }

  // 错误状态显示
  if (error) {
    return (
      <div className={cn('flex flex-col h-full overflow-hidden', className)}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* 看板列 */}
      <div className="flex-1 p-6 overflow-hidden relative">
        {/* Loading 覆盖层 */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        )}
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEndEvent}
        >
          <div className="flex gap-6 h-full overflow-x-auto">
            {COLUMNS.map((column) => {
              const columnTasks = (tasksByStatus && tasksByStatus[column.id]) || []
              const sortedTasks = getSortedTasks(column.id, columnTasks)
              
              return (
                <KanbanColumn
                  key={column.id}
                  title={column.title}
                  status={column.id}
                  tasks={sortedTasks}
                  insertPosition={insertPosition}
                  onToggleSort={toggleColumnSort}
                  getColumnSortState={getColumnSortState}
                />
              )
            })}
          </div>
          
          {/* 拖拽覆盖层 - 提供拖拽时的视觉反馈 */}
          <DragOverlay dropAnimation={dropAnimation}>
            {activeTask ? (
              <div 
                className="transform scale-105 shadow-2xl transition-transform duration-150 ease-out"
                style={{
                  transform: `rotate(${getRotationAngle()}deg) scale(1.05)`
                }}
              >
                <KanbanCard 
                  task={activeTask} 
                  insertPosition={undefined}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 空状态 */}
    </div>
  )
}