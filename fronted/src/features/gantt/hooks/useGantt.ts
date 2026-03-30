import { useCallback, useEffect, useMemo, useState } from 'react'
import { TaskService, type QueryTaskPageRequest } from '@/features/tasks/services/task-service'
import { Task, TaskStatus } from '@/features/tasks/data/schema'

export type GanttItem = {
  id: string
  name: string
  startTS: number
  duration: number
  status: string
  assignee?: number
  startDate: Date
  endDate: Date
}

export type GanttRange = {
  min: number
  max: number
}

export function useGantt(initialParams?: Partial<QueryTaskPageRequest>) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await TaskService.queryTaskPage({
        pageNum: '1',
        pageSize: '100',
        projectId: localStorage.getItem('selected_project_id') || '',
        ...(initialParams?.status ? { status: initialParams.status } : {}),
        ...(initialParams?.priority ? { priority: initialParams.priority } : {}),
        ...(initialParams?.taskTitle ? { taskTitle: initialParams.taskTitle } : {}),
      })
      setTasks(res.records || [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载任务失败')
    } finally {
      setLoading(false)
    }
  }, [initialParams?.priority, initialParams?.status, initialParams?.taskTitle])

  useEffect(() => {
    load()
  }, [load])

  const items: GanttItem[] = useMemo(() => {
    return (tasks || [])
      .filter(t => t.startTime && t.dueDate)
      .map(t => {
        const start = t.startTime as Date
        const end = t.dueDate as Date
        const startTS = start.getTime()
        const endTS = end.getTime()
        const duration = Math.max(0, endTS - startTS)
        return {
          id: t.id,
          name: t.taskCode || t.title,
          startTS,
          duration,
          status: t.status || TaskStatus.TODO,
          assignee: typeof t.assignee === 'number' ? t.assignee : undefined,
          startDate: start,
          endDate: end,
        }
      })
      .sort((a, b) => a.startTS - b.startTS)
  }, [tasks])

  const range: GanttRange | null = useMemo(() => {
    if (items.length === 0) return null
    const min = Math.min(...items.map(i => i.startTS))
    const max = Math.max(...items.map(i => i.startTS + i.duration))
    return { min, max }
  }, [items])

  return {
    tasks,
    items,
    range,
    loading,
    error,
    reload: load,
  }
}

