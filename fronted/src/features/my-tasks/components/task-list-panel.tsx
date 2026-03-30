import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import TaskCard from './task-card'
import type { Task } from '../../tasks/data/schema'

interface TaskListPanelProps {
  tasks: Task[]
  selectedTaskId: string | null
  searchQuery: string
  onTaskSelect: (taskId: string) => void
  onSearchChange: (query: string) => void
  loading: boolean
  error: string | null
  hasMore: boolean
  onLoadMore: () => void
  onRefresh: () => void
  className?: string
}

export function TaskListPanel({
  tasks,
  selectedTaskId,
  searchQuery,
  onTaskSelect,
  onSearchChange,
  loading,
  error,
  hasMore,
  onLoadMore,
  onRefresh,
  className
}: TaskListPanelProps) {
  const { t } = useTranslation()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef<HTMLDivElement>(null)

  // 监听滚动事件，实现无限滚动
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container || loading || !hasMore) return

    const { scrollTop, scrollHeight, clientHeight } = container
    // 当滚动到距离底部100px时触发加载更多
    if (scrollHeight - scrollTop - clientHeight < 100) {
      onLoadMore()
    }
  }, [loading, hasMore, onLoadMore])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  // 根据搜索查询过滤任务（如果需要前端过滤的话，但通常搜索应该在后端进行）
  const filteredTasks = useMemo(() => {
    return tasks
  }, [tasks])

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* 固定头部 */}
      <div className='flex-shrink-0 p-6 pb-4 border-b'>
        <h2 className='text-lg font-semibold mb-4'>{t('myTasks.taskList', '任务列表')}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('myTasks.searchPlaceholder', '搜索任务...')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* 错误状态 */}
      {error && (
        <div className="flex-shrink-0 p-4 bg-red-50 border-b border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              className="ml-auto h-6 px-2 text-red-600 hover:text-red-700"
            >
              <RefreshCw className="h-3 w-3" />
              重试
            </Button>
          </div>
        </div>
      )}
      
      {/* 可滚动内容区域 */}
      <div 
        ref={scrollContainerRef}
        className='flex-1 overflow-y-auto'
      >
        <div className='p-6 space-y-3'>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isSelected={task.id === selectedTaskId}
              onClick={() => onTaskSelect(task.id)}
            />
          ))}
          
          {/* 加载更多指示器 */}
          {loading && (
            <div 
              ref={loadingRef}
              className="flex items-center justify-center py-4 text-gray-500"
            >
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              加载中...
            </div>
          )}
          
          {/* 没有更多数据提示 */}
          {!hasMore && filteredTasks.length > 0 && (
            <div className="flex items-center justify-center py-4 text-gray-400 text-sm">
              已加载全部任务
            </div>
          )}
          
          {filteredTasks.length === 0 && !loading && (
            <div className='text-center text-muted-foreground py-8'>
              {searchQuery
                ? t('myTasks.emptyState.noResults', '没有找到匹配的任务')
                : error ? '加载失败' : t('myTasks.emptyState.noTasks', '暂无任务')
              }
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TaskListPanel