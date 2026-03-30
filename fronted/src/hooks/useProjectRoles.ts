import { useState, useEffect, useCallback, useRef } from 'react'
import { projectsService } from '@/features/projects/services/projects.service'
import { 
  ProjectRole, 
  RoleOption, 
  RoleLoadingState, 
  UseProjectRolesReturn 
} from '@/features/projects/types'
import { useDebounce } from './use-debounce'
import { showError, dismissToast } from '@/utils/error-handler'
import { useTranslation } from 'react-i18next'

/**
 * 项目角色数据管理Hook
 * 提供角色数据获取、缓存、错误处理和重试功能
 * 
 * @param projectId 项目ID
 * @param options 配置选项
 * @returns 角色数据和相关操作方法
 */
export function useProjectRoles(
  projectId: string | null,
  options: {
    /** 是否启用缓存，默认true */
    enableCache?: boolean
    /** 是否自动获取数据，默认true */
    autoFetch?: boolean
    /** 防抖延迟时间（毫秒），默认300 */
    debounceDelay?: number
    /** 是否在错误时显示toast提示，默认true */
    showErrorToast?: boolean
  } = {}
): UseProjectRolesReturn {
  const { t } = useTranslation()
  const {
    enableCache = true,
    autoFetch = true,
    debounceDelay = 300,
    showErrorToast = true
  } = options

  // 状态管理
  const [loadingState, setLoadingState] = useState<RoleLoadingState>('idle')
  const [roles, setRoles] = useState<ProjectRole[]>([])
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // 防抖处理projectId变化
  const debouncedProjectId = useDebounce(projectId, debounceDelay)
  
  // 用于取消请求的引用
  const abortControllerRef = useRef<AbortController | null>(null)
  
  // 最大重试次数
  const MAX_RETRY_COUNT = 3

  /**
   * 将ProjectRole转换为RoleOption格式
   */
  const transformToRoleOptions = useCallback((projectRoles: ProjectRole[]): RoleOption[] => {
    return projectRoles.map(role => ({
      value: role.roleId.toString(),
      label: role.roleName,
      roleId: role.roleId,
      roleName: role.roleName
    }))
  }, [])

  /**
   * 清除错误状态
   */
  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  /**
   * 获取角色数据
   */
  const fetchRoles = useCallback(async (
    targetProjectId: string,
    useCache: boolean = enableCache
  ): Promise<void> => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController()
    const signal = abortControllerRef.current.signal

    try {
      setLoadingState('loading')
      setError(null)

      // 选择使用缓存或直接API调用
      const fetchMethod = useCache 
        ? projectsService.listProjectRolesWithCache 
        : projectsService.listProjectRoles

      const response = await fetchMethod(targetProjectId, signal)
      
      // 检查请求是否被取消
      if (signal.aborted) {
        return
      }

      setRoles(response)
      setLoadingState('success')
      setRetryCount(0)
      
    } catch (err: unknown) {
      // 忽略取消的请求
      if (err instanceof Error && (err.name === 'AbortError' || signal.aborted)) {
        return
      }

      const errorMessage = err instanceof Error ? err.message : '获取角色列表失败'
      setError(errorMessage)
      setLoadingState('error')
      
      if (showErrorToast) {
        showError(err, {
          id: `project-roles-error-${targetProjectId}`,
          action: {
            label: t('common.retry', { defaultValue: '重试' }),
            onClick: () => {
              dismissToast(`project-roles-error-${targetProjectId}`)
              // 直接调用重试逻辑，避免循环依赖
              if (retryCount < MAX_RETRY_COUNT) {
                setRetryCount(prev => prev + 1)
                fetchRoles(targetProjectId, enableCache)
              }
            }
          }
        })
      }
    }
  }, [enableCache, showErrorToast, retryCount, t])

  /**
   * 重试获取数据
   */
  const retry = useCallback(async () => {
    if (!debouncedProjectId || retryCount >= MAX_RETRY_COUNT) {
      return
    }

    setRetryCount(prev => prev + 1)
    await fetchRoles(debouncedProjectId, enableCache)
  }, [debouncedProjectId, retryCount, fetchRoles, enableCache])

  /**
   * 手动刷新数据（不使用缓存）
   */
  const refresh = useCallback(async () => {
    if (!debouncedProjectId) {
      return
    }

    setRetryCount(0)
    await fetchRoles(debouncedProjectId, false)
  }, [debouncedProjectId, fetchRoles])

  /**
   * 清除缓存
   */
  const clearCache = useCallback(() => {
    projectsService.clearProjectRolesCache()
  }, [])

  // 自动获取数据
  useEffect(() => {
    if (!autoFetch || !debouncedProjectId) {
      return
    }

    fetchRoles(debouncedProjectId, enableCache)

    // 清理函数：取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [debouncedProjectId, autoFetch, fetchRoles, enableCache])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // 计算派生状态
  const isLoading = loadingState === 'loading'
  const isError = loadingState === 'error'
  const isSuccess = loadingState === 'success'
  const isEmpty = isSuccess && roles.length === 0
  const canRetry = isError && retryCount < MAX_RETRY_COUNT
  const roleOptions = transformToRoleOptions(roles)

  return {
    // 数据状态
    roles,
    roleOptions,
    loadingState,
    isLoading,
    isError,
    isSuccess,
    isEmpty,
    error,
    
    // 重试相关
    retryCount,
    canRetry,
    maxRetryCount: MAX_RETRY_COUNT,
    
    // 操作方法
    retry,
    refresh,
    clearError,
    clearCache
  }
}

/**
 * 简化版本的useProjectRoles Hook
 * 只返回基础的角色选项数据，适用于简单的下拉选择场景
 * 
 * @param projectId 项目ID
 * @returns 角色选项数组和加载状态
 */
export function useProjectRoleOptions(projectId: string | null) {
  const { roleOptions, isLoading, error } = useProjectRoles(projectId, {
    enableCache: true,
    autoFetch: true,
    showErrorToast: false
  })

  return {
    options: roleOptions,
    loading: isLoading,
    error
  }
}