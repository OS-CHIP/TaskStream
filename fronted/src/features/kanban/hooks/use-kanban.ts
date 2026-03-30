import { useState, useMemo, useCallback, useEffect } from 'react'
import { DragStartEvent, DragOverEvent, DragEndEvent } from '@dnd-kit/core'
import { Task, KanbanFilters, TaskStatus, TaskStatusType } from '@/features/tasks/data/schema'
import { TaskService, QueryTaskPageRequest } from '@/features/tasks/services/task-service'

// 排序状态类型
type SortState = 'none' | 'asc' | 'desc'
type SortType = 'deadline' | 'priority'

// 列排序状态
interface ColumnSortState {
  deadline: SortState
  priority: SortState
}

/**
 * 看板数据管理Hook
 * 提供任务数据的筛选、分组和状态管理功能
 */
export function useKanban() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0
  })
  const [filters, setFilters] = useState<KanbanFilters>({
    search: '',
    priority: [],
    label: [],
    assignee: [],
    dueDate: undefined
  })
  
  // 每列的排序状态
  const [columnSortStates, setColumnSortStates] = useState<Record<string, ColumnSortState>>({})

  // 加载任务数据
  const loadTasks = useCallback(async (params?: Partial<QueryTaskPageRequest>) => {
    setLoading(true)
    setError(null)
    
    try {
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        throw new Error('请先选择项目')
      }

      const queryParams: QueryTaskPageRequest = {
        pageNum: pagination.current.toString(),
        pageSize: pagination.pageSize.toString(),
        projectId,
        ...params
      }

      // 添加筛选条件
      if (filters.search) {
        queryParams.taskTitle = filters.search
      }
      if (filters.priority && filters.priority.length > 0) {
        // 将优先级字符串转换为数字
        const priorityMap: Record<string, string> = {
          'low': '1',
          'medium': '2', 
          'high': '3',
          'urgent': '4'
        }
        queryParams.priority = filters.priority.map(p => priorityMap[p] || p).join(',')
      }
      if (filters.status && filters.status.length > 0) {
        queryParams.status = filters.status.join(',')
      }

      const response = await TaskService.queryTaskPage(queryParams)
      setTasks(response.records)
      setPagination(prev => ({
        ...prev,
        total: response.total,
        current: response.current
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载任务失败'
      setError(errorMessage)
      console.error('加载任务失败:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination.current, pagination.pageSize, filters])

  // 初始化加载任务
  useEffect(() => {
    loadTasks()
  }, [])

  // 监听项目切换
  useEffect(() => {
    const handleProjectChange = () => {
      loadTasks()
    }
    
    // 监听localStorage变化
    window.addEventListener('storage', handleProjectChange)
    
    return () => {
      window.removeEventListener('storage', handleProjectChange)
    }
  }, [])

  // 筛选任务
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 搜索过滤
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false
      }
      
      // 优先级过滤
      const taskWithPriority = task as { priority?: string }
      if (filters.priority && filters.priority.length > 0 && taskWithPriority.priority && !filters.priority.some(p => p === taskWithPriority.priority)) {
        return false
      }
      
      // 标签过滤
      const taskWithLabel = task as { label?: string }
      if (filters.label && filters.label.length > 0 && taskWithLabel.label && !filters.label.some(l => l === taskWithLabel.label)) {
        return false
      }

      // 负责人过滤
      const taskWithAssignee = task as { assignee?: string }
      if (filters.assignee && filters.assignee.length > 0 && !filters.assignee.includes(taskWithAssignee.assignee || '')) {
        return false
      }
      
      // 截止日期过滤
      const taskWithDueDate = task as { dueDate?: string }
      if (filters.dueDate && taskWithDueDate.dueDate) {
        const taskDate = new Date(taskWithDueDate.dueDate)
        if (filters.dueDate.to && taskDate > filters.dueDate.to) {
          return false
        }
      }

      return true
    })
  }, [tasks, filters])

  // 按状态分组任务
  const tasksByStatus = useMemo(() => {
    const groups: Record<string, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.DONE]: [],
      [TaskStatus.CANCELED]: []
    }

    filteredTasks.forEach(task => {
      if (groups[task.status]) {
        groups[task.status].push(task)
      }
    })

    return groups
  }, [filteredTasks])

  // 更新筛选条件
  const updateFilters = useCallback((newFilters: Partial<KanbanFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    // 重置分页并重新加载数据
    setPagination(prev => ({ ...prev, current: 1 }))
    loadTasks()
  }, [loadTasks])

  // 清除筛选条件
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      priority: [],
      label: [],
      assignee: [],
      dueDate: undefined
    })
    // 重置分页并重新加载数据
    setPagination(prev => ({ ...prev, current: 1 }))
    loadTasks()
  }, [loadTasks])

  // 移动任务到新状态
  const moveTask = useCallback(async (taskId: string, newStatus: string) => {
    try {
      // 先更新本地状态以提供即时反馈
      setTasks(prev => 
        prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus as TaskStatusType }
            : task
        )
      )

      // 调用API同步到后端（传递任务类型以支持系统工单状态映射）
      const moved = tasks.find(t => t.id === taskId)
      const typeId = (moved as any)?.taskTypeId ?? (moved as any)?.type
      await TaskService.updateTaskStatus(taskId, newStatus as TaskStatusType, typeId)
    } catch (err) {
      console.error('更新任务状态失败:', err)
      // 如果API调用失败，重新加载数据以恢复正确状态
      loadTasks()
      setError('更新任务状态失败，请重试')
    }
  }, [loadTasks])

  // 移动任务到指定位置
  const moveTaskToPosition = useCallback(async (taskId: string, newStatus: string, targetTaskId: string, position: 'top' | 'bottom') => {
    try {
      // 先更新本地状态以提供即时反馈
      setTasks(prev => {
        // 首先更新任务状态
        const updatedTasks = prev.map(task => 
          task.id === taskId 
            ? { ...task, status: newStatus as TaskStatusType }
            : task
        )
        
        // 获取目标状态的所有任务
        const statusTasks = updatedTasks.filter(task => task.status === newStatus)
        const otherTasks = updatedTasks.filter(task => task.status !== newStatus)
        
        // 找到被移动的任务和目标任务
        const movedTask = statusTasks.find(task => task.id === taskId)
        const targetTask = statusTasks.find(task => task.id === targetTaskId)
        
        if (!movedTask || !targetTask) {
          return updatedTasks
        }
        
        // 从当前位置移除被移动的任务
        const tasksWithoutMoved = statusTasks.filter(task => task.id !== taskId)
        
        // 找到目标任务的索引
        const targetIndex = tasksWithoutMoved.findIndex(task => task.id === targetTaskId)
        
        // 计算插入位置
        const insertIndex = position === 'top' ? targetIndex : targetIndex + 1
        
        // 在指定位置插入任务
        const reorderedStatusTasks = [
          ...tasksWithoutMoved.slice(0, insertIndex),
          movedTask,
          ...tasksWithoutMoved.slice(insertIndex)
        ]
        
        // 合并所有任务
        return [...otherTasks, ...reorderedStatusTasks]
      })

      // 调用API同步到后端（传递任务类型以支持系统工单状态映射）
      const moved = tasks.find(t => t.id === taskId)
      const typeId = (moved as any)?.taskTypeId ?? (moved as any)?.type
      await TaskService.updateTaskStatus(taskId, newStatus as TaskStatusType, typeId)
    } catch (err) {
      console.error('更新任务位置失败:', err)
      // 如果API调用失败，重新加载数据以恢复正确状态
      loadTasks()
      setError('更新任务位置失败，请重试')
    }
  }, [loadTasks])

  // 同一列内重新排序任务
  const reorderTaskInSameColumn = useCallback((taskId: string, targetTaskId: string, position: 'top' | 'bottom') => {
    setTasks(prevTasks => {
      const tasks = [...prevTasks]
      const taskIndex = tasks.findIndex(t => t.id === taskId)
      const targetIndex = tasks.findIndex(t => t.id === targetTaskId)
      
      // 严格的边界检查
      if (taskIndex === -1 || targetIndex === -1 || taskIndex === targetIndex) {
        return tasks
      }
      
      // 获取要移动的任务
      const taskToMove = tasks[taskIndex]
      const targetTask = tasks[targetIndex]
      
      // 确保是同一列
      if (taskToMove.status !== targetTask.status) {
        return tasks
      }
      
      // 重新设计插入位置计算逻辑
      let insertIndex: number
      
      if (position === 'top') {
        // 插入到目标任务之前
        if (taskIndex < targetIndex) {
          // 被移动任务在目标任务之前，插入位置就是目标位置
          insertIndex = targetIndex
        } else {
          // 被移动任务在目标任务之后，插入位置是目标位置
          insertIndex = targetIndex
        }
      } else {
        // position === 'bottom'，插入到目标任务之后
        if (taskIndex < targetIndex) {
          // 被移动任务在目标任务之前，插入位置是目标位置
          insertIndex = targetIndex
        } else {
          // 被移动任务在目标任务之后，插入位置是目标位置+1
          insertIndex = targetIndex + 1
        }
      }
      
      // 移除要移动的任务
      const [movedTask] = tasks.splice(taskIndex, 1)
      
      // 重新计算插入位置（因为移除了一个元素）
      if (taskIndex < insertIndex) {
        insertIndex -= 1
      }
      
      // 确保插入位置在有效范围内
      insertIndex = Math.max(0, Math.min(insertIndex, tasks.length))
      
      // 插入到新位置
      tasks.splice(insertIndex, 0, movedTask)
      
      return tasks
    })
  }, [])

  // 循环切换排序状态
  const cycleSortState = useCallback((currentState: SortState): SortState => {
    switch (currentState) {
      case 'none': return 'asc'
      case 'asc': return 'desc'
      case 'desc': return 'none'
      default: return 'none'
    }
  }, [])

  // 切换列的排序状态
  const toggleColumnSort = useCallback((columnId: string, sortType: SortType) => {
    setColumnSortStates(prev => {
      const currentColumnState = prev[columnId] || { deadline: 'none', priority: 'none' }
      const currentState = currentColumnState[sortType]
      const newState = cycleSortState(currentState)
      
      // 如果切换到新的排序类型，清除其他排序状态
      const newColumnState: ColumnSortState = {
        deadline: sortType === 'deadline' ? newState : 'none',
        priority: sortType === 'priority' ? newState : 'none'
      }
      
      return {
        ...prev,
        [columnId]: newColumnState
      }
    })
  }, [cycleSortState])

  // 获取列的排序状态
  const getColumnSortState = useCallback((columnId: string): { deadline: SortState; priority: SortState } => {
    const columnState = columnSortStates[columnId]
    if (!columnState) return { deadline: 'none', priority: 'none' }
    return columnState
  }, [columnSortStates])

  // 应用排序到任务列表
  const getSortedTasks = useCallback((columnId: string, tasks: Task[]): Task[] => {
    const columnState = columnSortStates[columnId]
    if (!columnState) return tasks
    
    const { deadline: deadlineSort, priority: prioritySort } = columnState
    
    if (deadlineSort === 'none' && prioritySort === 'none') {
      return tasks
    }
    
    const sortedTasks = [...tasks]
    
    // 按截止时间排序
    if (deadlineSort !== 'none') {
      sortedTasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        return deadlineSort === 'asc' ? diff : -diff
      })
    }
    
    // 按优先级排序
    if (prioritySort !== 'none') {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      sortedTasks.sort((a, b) => {
        const aPriority = priorityOrder[a.priority] || 0
        const bPriority = priorityOrder[b.priority] || 0
        const diff = bPriority - aPriority
        return prioritySort === 'asc' ? -diff : diff
      })
    }
    
    return sortedTasks
  }, [columnSortStates])

  return {
    filters,
    filteredTasks,
    tasksByStatus,
    updateFilters,
    clearFilters,
    moveTask,
    moveTaskToPosition,
    reorderTaskInSameColumn,
    toggleColumnSort,
    getColumnSortState,
    getSortedTasks,
    loading,
    error,
    pagination,
    loadTasks
  }
}

/**
 * 拖拽功能Hook
 * 处理任务卡片的拖拽操作
 */
export function useDragAndDrop(
  moveTask: (taskId: string, newStatus: string) => void, 
  moveTaskToPosition: (taskId: string, newStatus: string, targetTaskId: string, position: 'top' | 'bottom') => void,
  tasks: Task[]
) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [insertPosition, setInsertPosition] = useState<{ taskId: string; position: 'top' | 'bottom' } | null>(null)

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = String(event.active.id)
    // 找到被拖拽的任务
    const task = tasks.find(t => t.id === taskId)
    setActiveTask(task || null)
    
    // 记录初始位置
     setDragOffset({ x: 0, y: 0 })
    
    // 添加拖拽开始的视觉反馈
    document.body.style.cursor = 'grabbing'
  }

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!active || !over) {
      setInsertPosition(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string
    const activeTask = tasks.find(task => task.id === activeId)
    
    if (!activeTask) {
      setInsertPosition(null)
      return
    }

    // 计算拖拽偏移量用于旋转动画
    if (event.delta) {
      setDragOffset({ x: event.delta.x, y: event.delta.y })
    }

    // 如果悬停在列上
    if (over.data.current?.type === 'column') {
      setInsertPosition(null)
      return
    }

    // 如果悬停在任务上
    if (over.data.current?.type === 'task') {
      const overTask = tasks.find(task => task.id === overId)
      if (!overTask || activeId === overId) {
        setInsertPosition(null)
        return
      }

      // 只允许跨列移动，禁用同列拖拽排序
      if (activeTask.status !== overTask.status) {
        // 跨列移动时显示插入位置
        const rect = over.rect
        const activeRect = active.rect.current.translated
        
        if (rect && activeRect) {
          const overCenterY = rect.top + rect.height / 2
          const activeCenterY = activeRect.top + activeRect.height / 2
          const position = activeCenterY < overCenterY ? 'top' : 'bottom'
          
          setInsertPosition({ taskId: overId, position })
        } else {
          setInsertPosition(null)
        }
      } else {
        // 同列内不允许拖拽排序
        setInsertPosition(null)
      }
    }
  }, [tasks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    // 恢复鼠标样式
    document.body.style.cursor = ''
    
    // 立即清理拖拽状态
    setActiveTask(null)
    setDragOffset({ x: 0, y: 0 })
    
    // 延迟清理插入位置，避免闪烁
    const clearInsertPosition = () => {
      setTimeout(() => setInsertPosition(null), 100)
    }
    
    if (!over || !active) {
      clearInsertPosition()
      return
    }

    const taskId = String(active.id)
    const overId = String(over.id)
    
    // 如果拖拽到自己身上，不做任何操作
    if (taskId === overId) {
      clearInsertPosition()
      return
    }
    
    try {
      // 如果拖拽到列上，移动任务到新状态
      if (over.data.current?.type === 'column') {
        moveTask(taskId, overId)
      }
      // 如果拖拽到任务上，需要重新排序并插入到指定位置
      else if (over.data.current?.type === 'task') {
        // 获取被拖拽任务和目标任务
        const draggedTask = tasks.find(t => t.id === taskId)
        const targetTask = tasks.find(t => t.id === overId)
        
        if (draggedTask && targetTask) {
          // 只允许跨列移动，禁用同列拖拽排序
          if (draggedTask.status !== targetTask.status) {
            // 跨列移动并插入到指定位置
            if (insertPosition && insertPosition.taskId === overId) {
              moveTaskToPosition(taskId, targetTask.status, overId, insertPosition.position)
            } else {
              // 简单跨列移动
              moveTask(taskId, targetTask.status)
            }
          }
          // 同列内不执行任何操作
        }
      }
    } finally {
      // 确保状态被清理
      clearInsertPosition()
    }
  }, [tasks, insertPosition, moveTask, moveTaskToPosition])

  // 计算基于拖拽方向的旋转角度
  const getRotationAngle = () => {
    const horizontalOffset = dragOffset.x
    // 根据水平位移计算旋转角度，最大5度
    const maxRotation = 5
    const minOffset = 20 // 最小偏移量才开始旋转
    
    if (Math.abs(horizontalOffset) < minOffset) {
      return 0
    }
    
    // 向右拖拽为正角度，向左拖拽为负角度
    const rotation = Math.sign(horizontalOffset) * Math.min(Math.abs(horizontalOffset) / 100 * maxRotation, maxRotation)
    return rotation
  }

  return {
    activeTask,
    dragOffset,
    insertPosition,
    getRotationAngle,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  }
}
