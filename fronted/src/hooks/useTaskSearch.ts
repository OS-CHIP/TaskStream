import { useState, useEffect, useCallback, useMemo } from 'react'
import { TaskService, QueryTaskPageRequest } from '@/features/tasks/services/task-service'
import { TaskMention, TaskSearchResult, generateTaskUrl } from '@/types/mention'
import { useDebounce } from './use-debounce'

interface UseTaskSearchOptions {
  searchDelay?: number
  maxResults?: number
  projectId?: string
}

export function useTaskSearch(options: UseTaskSearchOptions = {}) {
  const {
    searchDelay = 300,
    maxResults = 50,
    projectId: providedProjectId
  } = options

  const [tasks, setTasks] = useState<TaskMention[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // 使用防抖处理搜索查询
  const debouncedSearchQuery = useDebounce(searchQuery, searchDelay)

  // 获取项目ID
  const projectId = useMemo(() => {
    return providedProjectId || localStorage.getItem('selected_project_id') || ''
  }, [providedProjectId])

  // 转换API响应为TaskMention格式
  const transformTasksToMentions = useCallback((apiTasks: any[]): TaskMention[] => {
    return apiTasks.map(task => ({
      id: task.id.toString(),
      title: task.taskTitle || task.title || '未命名任务',
      status: task.status || 'unknown',
      priority: task.priority || 'medium',
      url: generateTaskUrl(task.id.toString(), projectId),
      projectId: projectId
    }))
  }, [projectId])

  // 搜索任务的核心函数
  const searchTasks = useCallback(async (query: string) => {
    if (!projectId) {
      setError('未找到项目ID，请先选择项目')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 构建查询参数
      const params: QueryTaskPageRequest = {
        pageNum: '1',
        pageSize: maxResults.toString(),
        projectId: projectId,
        ...(query.trim() && { taskTitle: query.trim() })
      }

      // 调用任务服务API
      const response = await TaskService.queryTaskPage(params)
      
      // TaskService.queryTaskPage 返回的是 QueryTaskPageResponse，不是 BackendApiResponse
      const apiTasks = response.records || []
      setTasks(transformTasksToMentions(apiTasks))
    } catch (err) {
      console.error('搜索任务失败:', err)
      setError(err instanceof Error ? err.message : '搜索任务时发生未知错误')
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [projectId, maxResults, transformTasksToMentions])

  // 当防抖后的搜索查询变化时执行搜索
  useEffect(() => {
    if (projectId) {
      searchTasks(debouncedSearchQuery)
    }
  }, [debouncedSearchQuery, projectId, searchTasks])

  // 手动触发搜索
  const triggerSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  // 清空搜索结果
  const clearSearch = useCallback(() => {
    setSearchQuery('')
    setTasks([])
    setError(null)
  }, [])

  // 重新加载任务列表
  const reloadTasks = useCallback(() => {
    if (projectId) {
      searchTasks(searchQuery)
    }
  }, [projectId, searchQuery, searchTasks])

  // 返回搜索结果和控制函数
  const result: TaskSearchResult & {
    searchQuery: string
    triggerSearch: (query: string) => void
    clearSearch: () => void
    reloadTasks: () => void
  } = {
    tasks,
    loading,
    error,
    hasMore: false, // 暂时不支持分页加载更多
    total: tasks.length,
    searchQuery,
    triggerSearch,
    clearSearch,
    reloadTasks
  }

  return result
}