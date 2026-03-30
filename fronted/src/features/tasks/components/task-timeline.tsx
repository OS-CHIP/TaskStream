import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  Edit, 
  AlertCircle, 
  Loader2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { UpdateLogsService, type UpdateLogRecord } from '../services/update-logs-service'
import { TaskService } from '../services/task-service'
import { useTranslation } from 'react-i18next'

interface TaskTimelineProps {
  className?: string
  taskId?: number // 任务ID
}

interface TimelineState {
  records: UpdateLogRecord[]
  loading: boolean
  error: string | null
  hasMore: boolean
  currentPage: number
  total: number
}

interface UserMapState {
  userMap: Map<number, string>
  loading: boolean
  error: string | null
}

interface TimelineEvent {
  id: string
  type: 'created' | 'updated' | 'status_changed' | 'assigned' | 'commented' | 'attachment_added' | 'subtask_added' | 'priority_changed' | 'due_date_changed'
  title: string
  description?: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  metadata: {
    operationType: string
    fieldName: string
    oldValue: string
    newValue: string
  }
}

const getEventIcon = (operationType: string): React.ComponentType<{ className?: string }> => {
  switch (operationType) {
    case 'INSERT':
      return Clock
    case 'UPDATE':
      return Edit
    case 'DELETE':
      return AlertCircle
    default:
      return AlertCircle
  }
}

// 字段名映射
const useFieldName = (tfn: (key: string, opts?: any) => string): Record<string, string> => ({
  priority: tfn('tasks.detail.timeline.fields.priority'),
  status: tfn('tasks.detail.timeline.fields.status'),
  title: tfn('tasks.detail.timeline.fields.title'),
  description: tfn('tasks.detail.timeline.fields.description'),
  assignee: tfn('tasks.detail.timeline.fields.assignee'),
  dueDate: tfn('tasks.detail.timeline.fields.dueDate'),
  estimatedHours: tfn('tasks.detail.timeline.fields.estimatedHours'),
  actualHours: tfn('tasks.detail.timeline.fields.actualHours'),
  type: tfn('tasks.detail.timeline.fields.type'),
  parentId: tfn('tasks.detail.timeline.fields.parentId'),
})

// 状态映射
const statusMap = (tfn: (key: string) => string): Record<string, string> => ({
  '1': tfn('tasks.status.todo'),
  '2': tfn('tasks.status.inProgress'),
  '3': tfn('tasks.status.done'),
  '4': tfn('tasks.status.canceled'),
  '5': tfn('tasks.status.blocked'),
})

// 优先级映射
const priorityMap = (tfn: (key: string) => string): Record<string, string> => ({
  '1': tfn('tasks.priority.low'),
  '2': tfn('tasks.priority.medium'),
  '3': tfn('tasks.priority.high'),
})

// 任务类型映射
const taskTypeMap = (tfn: (key: string) => string): Record<string, string> => ({
  'design_task': tfn('tasks.types.design_task'),
  'test_task': tfn('tasks.types.test_task'),
  'bug': tfn('tasks.types.bug'),
  'default': tfn('tasks.types.default'),
  'other': tfn('tasks.types.other'),
})

const getEventTitle = (operationType: string, fieldName?: string | null, tfn?: (key: string) => string, fieldMap?: Record<string, string>) => {
  switch (operationType) {
    case 'INSERT':
      return tfn ? tfn('common.create') : '创建记录'
    case 'UPDATE':
      if (fieldName) {
        const name = (fieldMap && fieldMap[fieldName]) || fieldName
        return name ? `${tfn ? tfn('common.update') : '更新'}${name}` : (tfn ? tfn('common.update') : '更新记录')
      }
      return tfn ? tfn('common.update') : '更新记录'
    case 'DELETE':
      return tfn ? tfn('common.delete') : '删除记录'
    default:
      return tfn ? tfn('common.other') : '其他操作'
  }
}

const getEventColor = (operationType: string) => {
  switch (operationType) {
    case 'INSERT':
      return 'text-blue-600 bg-blue-100'
    case 'UPDATE':
      return 'text-orange-600 bg-orange-100'
    case 'DELETE':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? '刚刚' : `${diffInMinutes}分钟前`
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInHours < 24 * 7) {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}天前`
  } else {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')
    return `${year}/${month}/${day} ${hour}:${minute}`
  }
}

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TaskTimeline({ className, taskId }: TaskTimelineProps) {
  const { t } = useTranslation()
  const [state, setState] = useState<TimelineState>({
    records: [],
    loading: false,
    error: null,
    hasMore: true,
    currentPage: 1,
    total: 0
  })
  
  const [userMapState, setUserMapState] = useState<UserMapState>({
    userMap: new Map(),
    loading: false,
    error: null
  })
  
  const containerRef = useRef<HTMLDivElement>(null)

  // 使用 useRef 存储用户加载状态，避免循环依赖
  const userLoadingRef = useRef(false)
  
  // 获取当前项目ID
  const currentProjectId = useMemo(() => {
    return localStorage.getItem('selected_project_id')
  }, [])
  
  // 加载项目用户信息
  const loadProjectUsers = useCallback(async () => {
    if (userLoadingRef.current) return
    
    userLoadingRef.current = true
    setUserMapState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        throw new Error('未找到项目ID')
      }
      
      const users = await TaskService.getProjectUsers(projectId)
      const userMap = new Map<number, string>()
      
      users.forEach(user => {
        userMap.set(user.value, user.label)
      })
      
      setUserMapState(prev => ({
        ...prev,
        userMap,
        loading: false
      }))
    } catch (error) {
      setUserMapState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载用户信息失败'
      }))
    } finally {
      userLoadingRef.current = false
    }
  }, []) // 移除所有依赖，使用 ref 管理状态

  // 只在项目ID变化时获取项目用户列表
  useEffect(() => {
    if (currentProjectId) {
      loadProjectUsers()
    }
  }, [currentProjectId, loadProjectUsers])

  // 使用 useRef 存储稳定的函数引用，避免循环依赖
  const loadUpdateLogsRef = useRef<((page?: number, reset?: boolean) => Promise<void>) | null>(null)
  
  // 加载更新日志数据
  const loadUpdateLogs = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (state.loading) return
    
    // 检查taskId是否有效
    if (!taskId || isNaN(taskId)) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: '无效的任务ID'
      }))
      return
    }
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await UpdateLogsService.queryUpdateLogs({
        currentPage: page.toString(),
        pageSize: '10',
        tableName: 'task',
        recordId: taskId
      })
      
      setState(prev => ({
        ...prev,
        records: reset ? response.data.records : [...prev.records, ...response.data.records],
        loading: false,
        hasMore: page < response.data.pages,
        currentPage: page,
        total: response.data.total
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '加载失败'
      }))
    }
  }, [taskId]) // 移除 state.loading 依赖，只保留 taskId

  // 更新 ref 引用
  loadUpdateLogsRef.current = loadUpdateLogs

  // 初始加载 - 只加载更新日志，不再重复加载项目用户
  useEffect(() => {
    if (taskId && !isNaN(taskId)) {
      loadUpdateLogsRef.current?.(1, true)
    }
  }, [taskId]) // 只依赖 taskId

  // 加载更多 - 使用 ref 引用避免循环依赖
  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      loadUpdateLogsRef.current?.(state.currentPage + 1, false)
    }
  }, [state.hasMore, state.loading, state.currentPage])

  // 刷新数据 - 使用 ref 引用避免循环依赖
  const refresh = useCallback(() => {
    loadUpdateLogsRef.current?.(1, true)
  }, [])

  // 无限滚动监听
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMore()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [loadMore])

  // 转换值为中文显示
  const convertValueToDisplay = (fieldName: string, value: string): string => {
    if (!value) return t('common.noData')
    
    switch (fieldName) {
      case 'status':
        return statusMap(t)[value] || value
      case 'priority':
        return priorityMap(t)[value] || value
      case 'type':
        return taskTypeMap(t)[value] || value
      case 'assignee':
      case 'owner': {
        const userId = parseInt(value, 10)
        if (isNaN(userId)) return value
        return userMapState.userMap.get(userId) || `${t('tasks.detail.timeline.user.unknown')}`
      }
      default:
        return value
    }
  }

  // 转换更新日志记录为时间线事件
  const timelineEvents: TimelineEvent[] = state.records.map(record => {
    const fieldName = record.fieldName || ''
    const newValueDisplay = convertValueToDisplay(fieldName, record.newValue || '')
    const oldValueDisplay = convertValueToDisplay(fieldName, record.oldValue || '')
    
    // 获取变更人信息 - 从createBy字段获取用户ID并显示用户名
    let userName = '系统'
    if (record.createBy) {
      // 从userMap中查找createBy对应的用户名
      userName = userMapState.userMap.get(record.createBy) || '未知用户'
    }
    
    return {
      id: record.id,
      type: 'updated',
      title: getEventTitle(record.operationType, record.fieldName, t, useFieldName(t)),
      description: newValueDisplay ? t('tasks.detail.timeline.updatedTo', { value: newValueDisplay }) : undefined,
      user: {
        id: record.createBy?.toString() || 'system',
        name: userName || t('tasks.detail.timeline.user.system'),
        avatar: undefined
      },
      timestamp: record.operationTime || record.createTime,
      metadata: {
        operationType: String(record.operationType || ''),
        fieldName: String(record.fieldName || ''),
        oldValue: oldValueDisplay,
        newValue: newValueDisplay
      }
    }
  })

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('tasks.detail.timeline.title')}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {t('tasks.detail.timeline.badge', { count: state.total })}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={state.loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={cn('h-4 w-4', state.loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="mt-2 h-8"
          >
            {t('common.retry')}
          </Button>
        </div>
      )}

      <div 
        ref={containerRef}
        className="max-h-96 space-y-4 overflow-y-auto"
      >
        {timelineEvents.map((event, index) => {
          const operationType = event.metadata.operationType || 'UPDATE'
          const Icon = getEventIcon(operationType)
          const isLast = index === timelineEvents.length - 1

          return (
            <div key={event.id} className="relative flex gap-3">
              {/* 时间线 */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full',
                  getEventColor(operationType)
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                {!isLast && (
                  <div className="mt-2 h-full w-px bg-border" />
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 space-y-2 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatDate(event.timestamp)}
                  </time>
                </div>

                {/* 元数据 */}
                <div className="space-y-1">
                  {event.metadata.fieldName && (
                    <Badge variant="outline" className="text-xs">
                      {t('tasks.detail.timeline.fieldLabel')}: {useFieldName(t)[event.metadata.fieldName] || event.metadata.fieldName}
                    </Badge>
                  )}
                  {event.metadata.oldValue && event.metadata.newValue && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {event.metadata.oldValue}
                      </Badge>
                      <span className="text-xs text-muted-foreground">→</span>
                      <Badge variant="outline" className="text-xs">
                        {event.metadata.newValue}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* 用户信息 */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={event.user.avatar} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(event.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">
                    {t('tasks.detail.timeline.changedBy')}：{event.user.name}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* 加载更多指示器 */}
        {state.loading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2 text-sm text-muted-foreground">{t('tasks.detail.timeline.loading')}</span>
          </div>
        )}

        {!state.loading && state.hasMore && timelineEvents.length > 0 && (
          <div className="flex justify-center py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMore}
              className="h-8"
            >
              {t('tasks.detail.timeline.loadMore')}
            </Button>
          </div>
        )}

        {!state.loading && !state.hasMore && timelineEvents.length > 0 && (
          <div className="flex justify-center py-4">
            <span className="text-sm text-muted-foreground">{t('tasks.detail.timeline.noMore')}</span>
          </div>
        )}

        {!state.loading && timelineEvents.length === 0 && !state.error && (
          <div className="flex flex-col items-center justify-center py-8">
            <Clock className="h-8 w-8 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">{t('tasks.detail.timeline.empty')}</span>
          </div>
        )}
      </div>
    </div>
  )
}
