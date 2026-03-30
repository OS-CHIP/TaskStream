import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { GripVertical } from 'lucide-react'
import TaskListPanel from './task-list-panel'
import TaskDetailPanel from './task-detail-panel'
import { useMyTasks } from '../hooks/useMyTasks'
import { AppHeader } from '@/components/layout/app-header'
import { TopNav } from '@/components/layout/top-nav'
import { Main } from '@/components/layout/main'

export const MyTasksPage: React.FC = () => {
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/my-tasks' })
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [leftWidth, setLeftWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用自定义hook获取任务数据
  const {
    tasks,
    loading,
    error,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
  } = useMyTasks();

  // 处理URL参数中的taskId自动选中
  useEffect(() => {
    if (search.taskId) {
      setSelectedTaskId(search.taskId)
    }
  }, [search.taskId])

  useEffect(() => {
    // 初始根据容器宽度设定一个相对合适的左栏宽度
    const el = containerRef.current
    if (el) {
      const rect = el.getBoundingClientRect()
      const initial = Math.max(280, Math.min(480, Math.floor(rect.width * 0.33)))
      setLeftWidth(initial)
    }
  }, [])

  const clampLeftWidth = (px: number) => {
    const el = containerRef.current
    if (!el) return px
    const rect = el.getBoundingClientRect()
    const min = 240
    const max = Math.max(min, rect.width - 360) // 右侧至少留 360px
    return Math.min(Math.max(px, min), max)
  }

  const startDragAt = (clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = clientX - rect.left
    setLeftWidth(clampLeftWidth(x))
  }

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)

    const onMove = (ev: MouseEvent) => startDragAt(ev.clientX)
    const onUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onTouchStart = () => {
    setIsDragging(true)

    const onMove = (ev: TouchEvent) => {
      if (ev.touches && ev.touches[0]) startDragAt(ev.touches[0].clientX)
    }
    const onEnd = () => {
      setIsDragging(false)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }

    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
  }

  // const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId)
    // 更新URL参数
    navigate({
      to: '/my-tasks',
      search: { taskId },
      replace: true,
    })
  }

  const topNavLinks = [
    {
      title: '我的任务',
      href: '/my-tasks',
      isActive: true,
      disabled: false,
    },
  ]

  return (
    <div className="flex h-screen flex-col">
      <AppHeader>
        <TopNav links={topNavLinks} />
      </AppHeader>
      <Main fixed className="flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className={`flex h-full overflow-hidden ${isDragging ? 'select-none' : ''}`}
        >
          {/* 左侧列表（宽度可拖动） */}
          <div className="h-full" style={{ width: leftWidth }}>
            <TaskListPanel
              tasks={tasks}
              selectedTaskId={selectedTaskId}
              onTaskSelect={handleTaskSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onLoadMore={loadMore}
              onRefresh={refresh}
              className="h-full"
            />
          </div>

          {/* 分割条（拖拽手柄） */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="调整面板宽度"
            className="group relative w-2 md:w-3 shrink-0 cursor-col-resize bg-border hover:bg-primary/20 active:bg-primary/30 transition-colors flex items-center justify-center"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            style={{ touchAction: 'none' }}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground opacity-60 group-hover:opacity-100" />
          </div>

          {/* 右侧详情（独立竖向滚动由内部组件控制） */}
          <div className="flex-1 min-w-0">
            <TaskDetailPanel 
              taskId={selectedTaskId} 
              className="h-full" 
              onTaskUpdate={refresh}
              onTaskSelect={handleTaskSelect}
            />
          </div>
        </div>
      </Main>
    </div>
  )
}
