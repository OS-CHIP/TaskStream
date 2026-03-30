/**
 * 项目切换器自定义Hook
 * 
 * @description 管理项目切换器的状态逻辑，包括项目选择、搜索过滤等功能
 * @author SOLO Document
 * @created 2024-01-20
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import type { 
  UseProjectSwitcherReturn, 
  UseProjectSwitcherOptions,
  Project
} from './types'
import { useProjectsQuery } from './use-projects-query'

/**
 * 搜索防抖延迟时间（毫秒）
 */
const SEARCH_DEBOUNCE_DELAY = 300

/**
 * 选中项目ID缓存管理器
 * 
 * @description 管理用户最后选中的项目ID的缓存，用于在下次访问时恢复选中状态
 */
class SelectedProjectCacheManager {
  private static readonly CACHE_KEY = 'selected_project_id'
  
  /**
   * 获取缓存的选中项目ID
   * @returns 缓存的项目ID，如果没有缓存则返回null
   */
  static getCachedSelectedProjectId(): string | null {
    try {
      const cachedId = localStorage.getItem(this.CACHE_KEY)
      return cachedId || null
    } catch (_error) {
      // 静默处理localStorage错误
      return null
    }
  }
  
  /**
   * 缓存选中的项目ID
   * @param projectId 要缓存的项目ID
   */
  static setCachedSelectedProjectId(projectId: string): void {
    try {
      localStorage.setItem(this.CACHE_KEY, projectId)
    } catch (_error) {
      // 静默处理localStorage错误
    }
  }
  
  /**
   * 清除缓存的选中项目ID
   */
  static clearCachedSelectedProjectId(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY)
    } catch (_error) {
      // 静默处理localStorage错误
    }
  }
}

// 导出缓存管理器实例
export const selectedProjectCacheManager = SelectedProjectCacheManager

/**
 * 项目切换器Hook
 * 
 * @param options Hook配置选项
 * @returns Hook返回值，包含状态和操作方法
 */
export function useProjectSwitcher({
  projects: externalProjects,
  defaultProjectId,
  onProjectChange
}: UseProjectSwitcherOptions = {}): UseProjectSwitcherReturn {
  // 获取所有项目数据（如果没有外部传入的项目数据）
  const { projects: queryProjects, isLoading, error } = useProjectsQuery()
  
  // 使用外部传入的项目数据或查询的项目数据
  const projects = externalProjects || queryProjects
  
  // 状态管理
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [showCountdownDialog, setShowCountdownDialog] = useState<boolean>(false)
  
  // 初始化当前项目
  useEffect(() => {
    if (projects.length === 0) {
      setCurrentProject(null)
      return
    }
    
    // 优先级：缓存的项目ID > 默认项目ID > 第一个项目
    let targetProject: Project | null = null
    
    // 1. 尝试从缓存恢复选中的项目
    const cachedProjectId = selectedProjectCacheManager.getCachedSelectedProjectId()
    if (cachedProjectId) {
      targetProject = projects.find(p => p.id === cachedProjectId) || null
      
      // 添加调试信息
      if (typeof window !== 'undefined' && window.console) {
        // eslint-disable-next-line no-console
        console.log('从缓存恢复项目ID:', { cachedProjectId, found: !!targetProject })
      }
    }
    
    // 2. 如果缓存中的项目不存在，尝试使用默认项目ID
    if (!targetProject && defaultProjectId) {
      targetProject = projects.find(p => p.id === defaultProjectId) || null
    }
    
    // 3. 如果都没有，选择第一个项目
    if (!targetProject) {
      targetProject = projects[0] || null
    }
    
    // 如果找到了目标项目且与当前项目不同，则更新
    if (targetProject && (!currentProject || currentProject.id !== targetProject.id)) {
      setCurrentProject(targetProject)
      
      // 如果没有缓存的项目ID，则缓存当前选中的项目ID
      if (!cachedProjectId) {
        selectedProjectCacheManager.setCachedSelectedProjectId(targetProject.id)
        
        // 添加调试信息
        if (typeof window !== 'undefined' && window.console) {
          // eslint-disable-next-line no-console
          console.log('默认选择第一个项目并缓存:', { projectId: targetProject.id, projectName: targetProject.name })
        }
      }
      
      // 调用外部回调通知项目变更
      if (onProjectChange) {
        onProjectChange(targetProject)
      }
    }
  }, [projects, defaultProjectId, currentProject, onProjectChange])
  const [searchValue, setSearchValue] = useState<string>('')
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [debouncedSearchValue, setDebouncedSearchValue] = useState<string>('')
  
  // 搜索防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, SEARCH_DEBOUNCE_DELAY)
    
    return () => clearTimeout(timer)
  }, [searchValue])
  
  // 过滤后的项目列表
  const filteredProjects = useMemo(() => {
    if (!debouncedSearchValue.trim()) {
      return projects
    }
    
    const normalizedSearch = debouncedSearchValue.toLowerCase().trim()
    
    return projects.filter(project => {
      const nameMatch = project.name.toLowerCase().includes(normalizedSearch)
      const descMatch = project.description?.toLowerCase().includes(normalizedSearch) || false
      return nameMatch || descMatch
    })
  }, [projects, debouncedSearchValue])
  
  // 处理项目选择
  const handleProjectSelect = useCallback((project: Project) => {
    // 如果选择的是当前项目，不显示倒计时对话框
    if (currentProject && currentProject.id === project.id) {
      setIsOpen(false)
      setSearchValue('') // 清空搜索
      return
    }
    
    setCurrentProject(project)
    setIsOpen(false)
    setSearchValue('') // 清空搜索
    
    // 缓存选中的项目ID
    selectedProjectCacheManager.setCachedSelectedProjectId(project.id)
    
    // 添加调试信息
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.log('项目已选中并缓存:', { projectId: project.id, projectName: project.name })
    }
    
    // 调用外部回调
    if (onProjectChange) {
      onProjectChange(project)
    }
    
    // 显示倒计时对话框
    setShowCountdownDialog(true)
  }, [currentProject, onProjectChange])
  
  // 清除选中项目缓存
  const clearSelectedProjectCache = useCallback(() => {
    selectedProjectCacheManager.clearCachedSelectedProjectId()
  }, [])
  
  // 优化的设置方法，避免不必要的重渲染
  const optimizedSetCurrentProject = useCallback((project: Project) => {
    setCurrentProject(prevProject => {
      if (prevProject?.id === project.id) {
        return prevProject // 避免不必要的更新
      }
      return project
    })
  }, [])
  
  const optimizedSetSearchValue = useCallback((value: string) => {
    setSearchValue(prevValue => {
      if (prevValue === value) {
        return prevValue // 避免不必要的更新
      }
      return value
    })
  }, [])
  
  const optimizedSetIsOpen = useCallback((open: boolean) => {
    setIsOpen(prevOpen => {
      if (prevOpen === open) {
        return prevOpen // 避免不必要的更新
      }
      return open
    })
  }, [])
  
  // 键盘导航支持
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setSearchValue('')
        break
      case 'ArrowDown':
      case 'ArrowUp':
        // 这里可以添加键盘导航逻辑
        // 由于使用Radix UI，大部分键盘导航会自动处理
        break
    }
  }, [isOpen])
  
  // 注册键盘事件监听
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown])
  
  // 点击外部关闭下拉菜单
  const handleClickOutside = useCallback((_event: MouseEvent) => {
    if (isOpen) {
      // 这个逻辑通常由Radix UI自动处理
      // 这里保留接口以备需要自定义处理
    }
  }, [isOpen])
  
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])
  
  return {
    currentProject,
    projects,
    filteredProjects,
    searchValue,
    isOpen,
    isLoading,
    error,
    showCountdownDialog,
    setCurrentProject: optimizedSetCurrentProject,
    setSearchValue: optimizedSetSearchValue,
    setIsOpen: optimizedSetIsOpen,
    handleProjectSelect,
    clearSelectedProjectCache,
    setShowCountdownDialog
  }
}

/**
 * 项目搜索Hook（独立的搜索功能）
 * 
 * @param projects 项目列表
 * @param initialSearchValue 初始搜索值
 * @returns 搜索相关的状态和方法
 */
export function useProjectSearch(
  projects: Project[], 
  initialSearchValue: string = ''
) {
  const [searchValue, setSearchValue] = useState(initialSearchValue)
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(initialSearchValue)
  
  // 搜索防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchValue(searchValue)
    }, SEARCH_DEBOUNCE_DELAY)
    
    return () => clearTimeout(timer)
  }, [searchValue])
  
  // 过滤结果
  const filteredProjects = useMemo(() => {
    if (!debouncedSearchValue.trim()) {
      return projects
    }
    
    const normalizedSearch = debouncedSearchValue.toLowerCase().trim()
    
    return projects.filter(project => {
      const nameMatch = project.name.toLowerCase().includes(normalizedSearch)
      const descMatch = project.description?.toLowerCase().includes(normalizedSearch) || false
      return nameMatch || descMatch
    })
  }, [projects, debouncedSearchValue])
  
  // 清空搜索
  const clearSearch = useCallback(() => {
    setSearchValue('')
  }, [])
  
  return {
    searchValue,
    setSearchValue,
    filteredProjects,
    clearSearch,
    isSearching: debouncedSearchValue.length > 0,
    hasResults: filteredProjects.length > 0
  }
}

/**
 * 项目状态管理Hook（简化版本）
 * 
 * @param defaultProject 默认项目
 * @returns 项目状态管理
 */
export function useProjectState(defaultProject?: Project) {
  const [currentProject, setCurrentProject] = useState<Project | null>(
    defaultProject || null
  )
  
  const selectProject = useCallback((project: Project) => {
    setCurrentProject(project)
  }, [])
  
  const clearProject = useCallback(() => {
    setCurrentProject(null)
  }, [])
  
  return {
    currentProject,
    setCurrentProject,
    selectProject,
    clearProject,
    hasProject: currentProject !== null
  }
}