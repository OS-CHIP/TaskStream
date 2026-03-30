import { useCallback } from 'react'
import { projectsService } from '@/features/projects/services/projects.service'
import { projectsCacheManager } from './use-projects-query'
import type { Project } from './types'

/**
 * 项目操作Hook
 * 
 * @description 提供项目的创建、更新、删除操作，并自动处理缓存更新
 */
export function useProjectOperations() {
  // 创建项目
  const createProject = useCallback(async (input: {
    projectName: string
    description?: string
    status: string
  }): Promise<Project> => {
    try {
      const result = await projectsService.create(input)
      
      // 创建成功后清除缓存，触发数据重新获取
      projectsCacheManager.clearCache()
      
      return result
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }, [])

  // 更新项目
  const updateProject = useCallback(async (id: string, patch: {
    name?: string
    description?: string
    status?: string
  }): Promise<Project> => {
    try {
      const result = await projectsService.update(id, {
        name: patch.name,
        description: patch.description,
        status: patch.status as '1' | '2' | undefined
      })
      
      // 更新成功后清除缓存，触发数据重新获取
      projectsCacheManager.clearCache()
      
      return result
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }, [])

  // 删除项目
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      await projectsService.delete(id)
      
      // 删除成功后清除缓存，触发数据重新获取
      projectsCacheManager.clearCache()
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }, [])

  // 手动刷新缓存
  const refreshProjects = useCallback(() => {
    projectsCacheManager.clearCache()
  }, [])

  return {
    createProject,
    updateProject,
    deleteProject,
    refreshProjects
  }
}

/**
 * 项目缓存管理Hook
 * 
 * @description 提供缓存相关的操作方法
 */
export function useProjectCache() {
  // 清除缓存
  const clearCache = useCallback(() => {
    projectsCacheManager.clearCache()
  }, [])

  // 手动刷新项目数据
  const refreshProjects = useCallback(() => {
    projectsCacheManager.clearCache()
  }, [])

  return {
    clearCache,
    refreshProjects
  }
}
