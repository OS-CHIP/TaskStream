/**
 * 项目数据查询Hook
 * 
 * @description 使用真实API接口获取项目数据的自定义Hook
 * @author SOLO Coding
 * @created 2024-01-20
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { projectsService } from '@/features/projects/services/projects.service'
import type { Project } from './types'
import { useAuthStore } from '@/stores/authStore'

// Hook 返回值类型
export interface UseProjectsQueryState {
  projects: Project[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  clearCache: () => void
}

// 缓存键
const PROJECTS_CACHE_KEY = 'projects_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

// 缓存数据结构
interface CachedData {
  data: Project[]
  timestamp: number
}

// 全局缓存管理器
class ProjectsCacheManager {
  private static instance: ProjectsCacheManager
  private listeners: Set<() => void> = new Set()

  static getInstance(): ProjectsCacheManager {
    if (!ProjectsCacheManager.instance) {
      ProjectsCacheManager.instance = new ProjectsCacheManager()
    }
    return ProjectsCacheManager.instance
  }

  // 添加缓存更新监听器
  addListener(listener: () => void) {
    this.listeners.add(listener)
  }

  // 移除缓存更新监听器
  removeListener(listener: () => void) {
    this.listeners.delete(listener)
  }

  // 清除缓存并通知所有监听器
  clearCache() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((k) => {
        if (k.startsWith(PROJECTS_CACHE_KEY)) {
          localStorage.removeItem(k)
        }
      })
      // 通知所有监听器缓存已清除
      this.listeners.forEach(listener => {
        try {
          listener()
        } catch (err) {
          console.warn('Error in cache listener:', err)
        }
      })
    } catch (err) {
      console.warn('Failed to clear projects cache:', err)
    }
  }
}

// 导出缓存管理器实例
export const projectsCacheManager = ProjectsCacheManager.getInstance()

/**
 * 项目数据查询Hook
 * 
 * @description 负责获取项目数据，包含加载状态、错误处理、缓存机制和重新获取数据功能
 * @returns 项目数据查询相关状态和方法
 */
export function useProjectsQuery(): UseProjectsQueryState {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const userId = useAuthStore((s) => s.auth.userInfo?.id)
  const cacheKey = `${PROJECTS_CACHE_KEY}_${userId ?? 'anonymous'}`

  // 从缓存中获取数据
  const getCachedData = useCallback((): Project[] | null => {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null
      
      const parsed = JSON.parse(cached) as unknown
      // 基本结构校验
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !('data' in (parsed as Record<string, unknown>)) ||
        !('timestamp' in (parsed as Record<string, unknown>))
      ) {
        localStorage.removeItem(PROJECTS_CACHE_KEY)
        return null
      }
      const cachedData = parsed as CachedData
      const now = Date.now()
      
      // 检查缓存是否过期
      if (now - cachedData.timestamp > CACHE_DURATION) {
        localStorage.removeItem(PROJECTS_CACHE_KEY)
        return null
      }
      
      // 确保 data 是数组
      if (!Array.isArray(cachedData.data)) {
        localStorage.removeItem(PROJECTS_CACHE_KEY)
        return null
      }
      
      return cachedData.data
    } catch (err) {
      console.warn('Failed to read projects cache:', err)
      localStorage.removeItem(cacheKey)
      return null
    }
  }, [cacheKey])

  // 缓存数据
  const setCachedData = useCallback((data: Project[]) => {
    try {
      const cacheData: CachedData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (err) {
      console.warn('Failed to cache projects data:', err)
    }
  }, [cacheKey])

  // 获取项目数据的函数
  const fetchProjects = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // 如果不是强制刷新，先尝试从缓存获取数据
      if (!forceRefresh) {
        const cachedProjects = getCachedData()
        if (cachedProjects) {
          setProjects(cachedProjects)
          // 继续向后端请求最新数据以保证准确性
        }
      }
      
      // 调用项目服务，固定传递 status: '1' 参数，并拉取较大的 pageSize 以避免分页截断
      const result = await projectsService.list({ status: '1', pageSize: 9999 })
      const rawItems = (result.items ?? []) as unknown as RawProject[]
      const mapped: Project[] = rawItems.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        avatar: p.avatar,
        status: p.status === '1' ? 'active' : p.status === '0' ? 'archived' : p.status,
        createdAt: new Date(p.created_at ?? p.createdAt ?? Date.now()),
        updatedAt: p.updated_at ? new Date(p.updated_at) : (p.updatedAt ? new Date(p.updatedAt) : undefined),
      }))
      setProjects(mapped)
      
      // 添加调试信息
      if (typeof window !== 'undefined' && window.console) {
        // eslint-disable-next-line no-console
        console.log('项目数据已加载:', { count: mapped.length, projects: mapped.map(p => ({ id: p.id, name: p.name })) })
      }
      
      // 缓存数据
      setCachedData(mapped)
    } catch (err) {
      // 捕获失败时，将错误信息写入状态并回退为空数组
      setError(err instanceof Error ? err.message : '获取项目列表失败')
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [getCachedData, setCachedData])

  // 组件挂载时获取数据
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // 监听缓存清除事件
  useEffect(() => {
    const handleCacheCleared = () => {
      // 当缓存被清除时，重新获取数据
      fetchProjects(true)
    }

    // 注册监听器
    projectsCacheManager.addListener(handleCacheCleared)

    // 清理函数
    return () => {
      projectsCacheManager.removeListener(handleCacheCleared)
    }
  }, [fetchProjects])

  // 重新获取数据的方法
  const refetch = useCallback(() => {
    fetchProjects(true) // 强制刷新
  }, [fetchProjects])

  // 清除缓存的方法
  const clearCache = useCallback(() => {
    projectsCacheManager.clearCache()
  }, [])

  return {
    projects,
    isLoading,
    error,
    refetch,
    clearCache
  }
}

/**
 * 项目搜索Hook（基于API）
 * 
 * @param searchValue 搜索关键词
 * @param debounceMs 防抖延迟时间
 * @returns 搜索结果和状态
 */
export function useProjectsSearch(
  searchValue: string,
  debounceMs: number = 300
): UseProjectsQueryState {
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue)
  const { projects: allProjects, isLoading, error, refetch, clearCache } = useProjectsQuery()

  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchValue, debounceMs])

  // 过滤项目
  const filteredProjects = useMemo(() => {
    if (!debouncedSearchValue.trim()) {
      return allProjects
    }
    
    const normalizedSearch = debouncedSearchValue.toLowerCase().trim()
    
    return allProjects.filter(project => {
      const nameMatch = project.name.toLowerCase().includes(normalizedSearch)
      const descMatch = project.description?.toLowerCase().includes(normalizedSearch) || false
      return nameMatch || descMatch
    })
  }, [allProjects, debouncedSearchValue])

  return {
    projects: filteredProjects,
    isLoading,
    error,
    refetch,
    clearCache
  }
}

// 为了在不同来源的字段命名之间进行兼容，定义原始项目类型的联合表示
type RawProject = {
  id: string
  name: string
  description?: string
  avatar?: string
  status: '1' | '0' | 'active' | 'archived'
  created_at?: string
  updated_at?: string
  createdAt?: string
  updatedAt?: string
}
