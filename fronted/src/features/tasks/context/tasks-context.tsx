import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useLocation } from '@tanstack/react-router'
import useDialogState from '@/hooks/use-dialog-state'
import { Task } from '../data/schema'
import { TaskService, QueryTaskPageRequest } from '../services/task-service'

type TasksDialogType = 'update' | 'delete' | 'import' | 'progress'

interface TasksContextType {
  open: TasksDialogType | null
  setOpen: (str: TasksDialogType | null) => void
  currentRow: Task | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Task | null>>
  tasks: Task[]
  loading: boolean
  error: string | null
  filters: {
    status?: string
    priority?: string
    search?: string
    searchBy?: 'title' | 'code'
    people?: number[]
    roleDims?: Array<'assignee' | 'assigner'>
  }
  setFilters: (filters: { status?: string; priority?: string; search?: string; searchBy?: 'title' | 'code'; people?: number[]; roleDims?: Array<'assignee' | 'assigner'> }) => void
  fetchTasks: (customFilters?: { status?: string; priority?: string; search?: string; searchBy?: 'title' | 'code'; people?: number[]; roleDims?: Array<'assignee' | 'assigner'> }, customPagination?: { pageIndex: number; pageSize: number }) => Promise<void>
  updateTaskStatus: (taskId: string, newStatus: string) => Promise<void>
  pagination: { pageIndex: number; pageSize: number; total: number }
  setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number; total: number }>>
  userMap: Record<number, string>
}

const TasksContext = React.createContext<TasksContextType | null>(null)

interface Props {
  children: React.ReactNode
}

export default function TasksProvider({ children }: Props) {
  const location = useLocation()

  const getUrlPage = useCallback(() => {
    return parseInt((location.search as any).page || '1', 10)
  }, [location.search])

  const [open, setOpen] = useDialogState<TasksDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Task | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<{ status?: string; priority?: string; search?: string; searchBy?: 'title' | 'code'; people?: number[]; roleDims?: Array<'assignee' | 'assigner'> }>({ searchBy: 'title', roleDims: ['assignee', 'assigner'] })
  const [pagination, setPagination] = useState({ pageIndex: getUrlPage() - 1, pageSize: 10, total: 0 })
  const [userMap, setUserMap] = useState<Record<number, string>>({})

  const currentUrlPage = getUrlPage()

  // 监听 URL 变化，同步到分页状态
  useEffect(() => {
    const newPage = getUrlPage()
    setPagination(prev => {
      const newPageIndex = newPage - 1
      if (prev.pageIndex !== newPageIndex) {
        return { ...prev, pageIndex: newPageIndex }
      }
      return prev
    })
  }, [currentUrlPage, getUrlPage])

  // 加载用户映射数据
  useEffect(() => {
    const loadUserMap = async () => {
      try {
        const opts = await TaskService.getTaskOptions()
        const map: Record<number, string> = {}
        opts.assignees.forEach(user => {
            map[user.value] = user.label
        })
        setUserMap(map)
      } catch (err) {
        console.error('Failed to load user options:', err)
      }
    }
    loadUserMap()
  }, [])

  // 合并filters的setFilters方法
  const setFilters = useCallback((newFilters: { status?: string; priority?: string; search?: string; searchBy?: 'title' | 'code'; people?: number[]; roleDims?: Array<'assignee' | 'assigner'> }) => {
    setFiltersState(prevFilters => {
      // 检查是否真的有变化，避免不必要的状态更新
      const hasChanges = Object.keys(newFilters).some(key => {
        const filterKey = key as keyof typeof newFilters
        return prevFilters[filterKey] !== newFilters[filterKey]
      })
      
      if (!hasChanges) {
        return prevFilters
      }
      
      return { ...prevFilters, ...newFilters }
    })
  }, [])



  // 优先级映射函数：将字符串优先级转换为数值
  const mapPriorityToNumber = (priority: string): string => {
    const priorityMap: Record<string, string> = {
      'low': '1',      // 低优先级 -> 1
      'medium': '2',   // 中优先级 -> 2
      'high': '3'      // 高优先级 -> 3
    }
    return priorityMap[priority] || priority
  }

  const fetchRequestRef = useRef<Promise<void> | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const filtersRef = useRef(filters)
  const requestCacheRef = useRef<Map<string, Promise<void>>>(new Map())
  
  // 保持filtersRef与最新的filters同步
  useEffect(() => {
    filtersRef.current = filters
  }, [filters])
  
  // 生成请求缓存键
  const generateCacheKey = useCallback((filters: { status?: string; priority?: string; search?: string; searchBy?: 'title' | 'code'; people?: number[]; roleDims?: Array<'assignee' | 'assigner'> }, pagination: { pageIndex: number; pageSize: number }) => {
    const projectId = localStorage.getItem('selected_project_id') || ''
    return JSON.stringify({
      projectId,
      status: filters.status || '',
      priority: filters.priority || '',
      search: filters.search || '',
      searchBy: filters.searchBy || 'title',
      people: (filters.people || []).join(','),
      roleDims: (filters.roleDims || []).join(','),
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize
    })
  }, [])

  const fetchTasks = useCallback(async (customFilters?: { status?: string; priority?: string; search?: string; searchBy?: 'title' | 'code'; people?: number[]; roleDims?: Array<'assignee' | 'assigner'> }, customPagination?: { pageIndex: number; pageSize: number }) => {
    // 使用传入的筛选条件或当前的筛选条件
    const currentFilters = customFilters || filtersRef.current
    const currentPagination = customPagination || pagination
    const cacheKey = generateCacheKey(currentFilters, currentPagination)
    
    // 如果相同参数的请求正在进行中，直接返回该请求
    const existingRequest = requestCacheRef.current.get(cacheKey)
    if (existingRequest) {
      console.log('🔄 复用现有请求，避免重复调用')
      return existingRequest
    }
    
    // 如果正在加载中，避免重复请求
    if (loading) {
      return
    }
    
    // 如果已有不同参数的请求在进行中，取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    abortControllerRef.current = abortController

    const request = async () => {
      console.log('🚀 开始获取任务列表...')
      setLoading(true)
      setError(null)
      try {
        // 从localStorage获取选中的项目ID
        const selectedProjectId = localStorage.getItem('selected_project_id')
        
        // 如果没有选中的项目ID，显示错误信息
        if (!selectedProjectId) {
          setError('请先选择一个项目')
          setLoading(false)
          return
        }
        
        // currentFilters 已在函数开头定义
        // 从本地缓存中获取用户ID（仅前端修改，不依赖 store）
        // 多选负责人/指派人：若存在选择，则传逗号分隔字符串；未选择表示不过滤

        const params: QueryTaskPageRequest = {
          pageNum: (currentPagination.pageIndex + 1).toString(),
          pageSize: currentPagination.pageSize.toString(),
          projectId: selectedProjectId,
          ...(currentFilters.people && currentFilters.people.length > 0 && (currentFilters.roleDims || []).includes('assignee') ? { assignee: currentFilters.people.join(',') } : {}),
          ...(currentFilters.people && currentFilters.people.length > 0 && (currentFilters.roleDims || []).includes('assigner') ? { assigner: currentFilters.people.join(',') } : {}),
          ...(currentFilters.status && { status: currentFilters.status }),
          ...(currentFilters.priority && { priority: mapPriorityToNumber(currentFilters.priority) }),
          ...(currentFilters.search && currentFilters.searchBy === 'code' && { taskCode: currentFilters.search }),
          ...(currentFilters.search && (!currentFilters.searchBy || currentFilters.searchBy === 'title') && { taskTitle: currentFilters.search })
        }
        
        console.log('📤 发送API请求:', params)
         const response = await TaskService.queryTaskPage(params, abortController.signal)
         console.log('📥 API响应:', response)
        
        if (!abortController.signal.aborted) {
          const convertedTasks = response.records
          console.log('✅ 转换后的任务数据:', convertedTasks)
          setTasks(convertedTasks)
          setPagination(prev => ({ ...prev, total: response.total }))
        }
      } catch (err) {
        if (err instanceof Error && (err.name === 'AbortError' || err.name === 'CanceledError')) {
          console.log('🔄 请求被取消，这是正常的去重行为')
          return // 请求被取消，不显示错误
        }
        console.error('❌ 获取任务列表失败:', err)
        const errorMessage = err instanceof Error ? err.message : '获取任务列表失败'
        setError(errorMessage)
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
        fetchRequestRef.current = null
        abortControllerRef.current = null
        // 清除缓存中的请求
        requestCacheRef.current.delete(cacheKey)
      }
    }

    const requestPromise = request()
    fetchRequestRef.current = requestPromise
    // 将请求添加到缓存中
    requestCacheRef.current.set(cacheKey, requestPromise)
    
    return requestPromise
  }, [loading, generateCacheKey, pagination])

  const updateTaskStatus = useCallback(async (taskId: string, newStatus: string) => {
    try {
      const currentTask = tasks.find(t => t.id === taskId)
      const typeId = (currentTask as any)?.taskTypeId ?? (currentTask as any)?.type
      const result = await TaskService.updateTaskStatus(taskId, newStatus as "1" | "2" | "3" | "4", typeId)
      if (result.success) {
        // 更新本地状态
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, status: newStatus as "1" | "2" | "3" | "4" }
              : task
          )
        )
        // 可以显示成功消息
        console.log('✅ 任务状态更新成功')
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error('❌ 更新任务状态失败:', err)
      const errorMessage = err instanceof Error ? err.message : '更新任务状态失败'
      setError(errorMessage)
      // 重新获取任务列表以确保数据一致性 - 触发重新渲染
      setFiltersState(prev => ({ ...prev }))
    }
  }, [tasks])

  const isFirstRender = useRef(true)

  // 监听filters变化自动触发fetchTasks
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    // 当筛选条件变化时，若当前已在第一页则直接拉取；否则重置到第一页，分页变化会触发拉取
    if (pagination.pageIndex === 0) {
      fetchTasks()
    } else {
      setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.priority, filters.search, filters.searchBy, filters.people, filters.roleDims])

  // 监听pagination变化触发fetchTasks
  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.pageIndex, pagination.pageSize])

  return (
    <TasksContext.Provider value={{ 
      open, 
      setOpen, 
      currentRow, 
      setCurrentRow, 
      tasks, 
      loading, 
      error, 
      filters,
      setFilters,
      fetchTasks,
      updateTaskStatus,
      pagination,
      setPagination,
      userMap
    }}>
      {children}
    </TasksContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const tasksContext = React.useContext(TasksContext)

  if (!tasksContext) {
    throw new Error('useTasks has to be used within <TasksContext>')
  }

  return tasksContext
}
