import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { TaskMention, PopupPosition } from '@/types/mention'
import { useTaskSearch } from '@/hooks/useTaskSearch'

interface TaskMentionPopupProps {
  isOpen: boolean
  position: PopupPosition
  searchQuery: string
  onSelect: (task: TaskMention) => void
  onClose: () => void
  onSearchChange: (query: string) => void
  projectId?: string
  className?: string
}

// 任务状态图标映射
const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'done':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'in_progress':
    case 'doing':
      return <Clock className="h-4 w-4 text-blue-500" />
    case 'todo':
    case 'pending':
      return <AlertCircle className="h-4 w-4 text-gray-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-400" />
  }
}

// 优先级颜色映射
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
    case '高':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'medium':
    case '中':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'low':
    case '低':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// 任务项组件
interface TaskItemProps {
  task: TaskMention
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isSelected, onClick, onMouseEnter }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {getStatusIcon(task.status)}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{task.title}</span>
          <Badge 
            variant="outline" 
            className={cn('text-xs', getPriorityColor(task.priority))}
          >
            {task.priority}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          ID: {task.id}
        </div>
      </div>
    </div>
  )
}

export const TaskMentionPopup: React.FC<TaskMentionPopupProps> = ({
  isOpen,
  position,
  searchQuery,
  onSelect,
  onClose,
  onSearchChange,
  projectId,
  className
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery)
  const popupRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 使用任务搜索Hook
  const { tasks, loading, error, triggerSearch } = useTaskSearch({
    projectId,
    maxResults: 50,
    searchDelay: 300
  })

  // 处理搜索输入变化
  const handleSearchChange = useCallback((value: string) => {
    setInternalSearchQuery(value)
    onSearchChange(value)
    triggerSearch(value)
    setSelectedIndex(0) // 重置选中索引
  }, [onSearchChange, triggerSearch])

  // 处理键盘导航
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, tasks.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (tasks[selectedIndex]) {
          onSelect(tasks[selectedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        onClose()
        break
    }
  }, [isOpen, tasks, selectedIndex, onSelect, onClose])

  // 处理鼠标选择
  const handleMouseSelect = useCallback((index: number) => {
    setSelectedIndex(index)
  }, [])

  // 处理任务点击
  const handleTaskClick = useCallback((task: TaskMention) => {
    onSelect(task)
  }, [onSelect])

  // 监听键盘事件
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleKeyDown])

  // 监听外部点击关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // 自动聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // 同步外部搜索查询
  useEffect(() => {
    if (searchQuery !== internalSearchQuery) {
      setInternalSearchQuery(searchQuery)
    }
  }, [searchQuery, internalSearchQuery])

  // 重置选中索引当任务列表变化时
  useEffect(() => {
    setSelectedIndex(0)
  }, [tasks])

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className={cn(
        'absolute z-50 w-80 bg-popover border border-border rounded-lg shadow-lg',
        'animate-in fade-in-0 zoom-in-95 flex flex-col',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        maxHeight: 'min(300px, 40vh)',
        minHeight: '200px'
      }}
    >
      {/* 搜索框 */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={internalSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索任务..."
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* 任务列表 */}
      <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {loading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">搜索中...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {internalSearchQuery ? '未找到相关任务' : '暂无任务'}
            </p>
          </div>
        )}

        {!loading && !error && tasks.length > 0 && (
          <div className="py-1">
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={index === selectedIndex}
                onClick={() => handleTaskClick(task)}
                onMouseEnter={() => handleMouseSelect(index)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* 底部提示 */}
      <div className="px-3 py-2 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground">
          ↑↓ 选择 • Enter 确认 • Esc 取消
        </p>
      </div>
    </div>
  )
}