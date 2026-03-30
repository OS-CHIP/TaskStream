import { useState, useMemo, useEffect, useCallback } from 'react'
import { GanttItem, GanttRange } from './useGantt'
import { mockGanttData, mockMembers } from '../data/mock-data'

export function useMockGantt() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tasks, setTasks] = useState<GanttItem[]>([])
  const [query, setQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<string>('')
  const [onlyMarked, setOnlyMarked] = useState<boolean>(false)
  const [markedIds, setMarkedIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('gantt_marked_ids')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      // 使用假数据
      setTasks(mockGanttData)
    } catch (e) {
      setError('加载任务失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('gantt_marked_ids', JSON.stringify(markedIds))
    } catch {}
  }, [markedIds])

  // 过滤任务
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // 按标题搜索
    if (query.trim()) {
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(query.toLowerCase())
      )
    }

    // 按成员筛选
    if (selectedMember && selectedMember !== 'all') {
      const memberId = Number(selectedMember)
      filtered = filtered.filter(task => task.assignee === memberId)
    }

    // 仅显示标记任务
    if (onlyMarked) {
      filtered = filtered.filter(task => markedIds.includes(task.id))
    }

    return filtered
  }, [tasks, query, selectedMember, onlyMarked, markedIds])

  const items = filteredTasks

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
    query,
    setQuery,
    selectedMember,
    setSelectedMember,
    members: mockMembers,
    // 标记相关
    markedIds,
    onlyMarked,
    setOnlyMarked,
    toggleMark: (id: string) => {
      setMarkedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
    },
    clearMarks: () => setMarkedIds([]),
  }
}
