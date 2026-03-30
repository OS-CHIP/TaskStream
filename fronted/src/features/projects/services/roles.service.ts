import { apiClient } from '@/lib/api-client'
import type {
  QueryProjectRolesRequest,
  ProjectRole
} from '../types'
import { showError } from '@/utils/error-handler'

/**
 * 项目角色服务
 * 负责处理项目角色相关的API调用
 */
export const rolesService = {
  /**
   * 查询项目角色列表
   * @param projectId 项目ID
   * @param signal 取消信号（可选）
   * @returns Promise<ProjectRole[]> 角色列表
   */
  async queryProjectRoles(
    projectId: string | number,
    signal?: AbortSignal
  ): Promise<ProjectRole[]> {
    try {
      // 构建请求参数
      const requestData: QueryProjectRolesRequest = {
        projectId
      }

      // 使用 multipart/form-data 格式发送请求
      const response = await apiClient.postFormData<ProjectRole[]>(
        '/roles/queryProjectRoles',
        requestData as unknown as Record<string, unknown>,
        {
          signal,
          skipErrorHandler: true
        }
      )

      // 检查API响应状态
      if (response.code !== 200) {
        throw new Error(response.msg || '获取项目角色失败')
      }

      // 验证响应数据
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('API返回数据格式错误')
      }

      // 数据转换和验证
      const roles: ProjectRole[] = response.data.map((role, _index) => {
        // 验证必要字段
        if (typeof role.roleId !== 'number' || !role.roleName) {
          // 角色数据格式错误，记录用于调试
          throw new Error(`角色数据格式错误：缺少必要字段`)
        }

        return {
          roleId: role.roleId,
          roleName: role.roleName.trim() // 清理角色名称的空白字符
        }
      })

      // 去重处理（基于roleId）
      const uniqueRoles = roles.filter((role, index, self) => 
        index === self.findIndex(r => r.roleId === role.roleId)
      )

      return uniqueRoles
    } catch (error: unknown) {
      // 处理取消请求的情况
      const axiosError = error as { 
        code?: string; 
        name?: string;
        response?: { status: number };
        message?: string;
      }

      if (
        axiosError.code === 'ERR_CANCELED' || 
        axiosError.name === 'CanceledError' || 
        axiosError.name === 'AbortError'
      ) {
        throw error // 直接抛出取消错误，不记录日志
      }

      // Query project roles failed, error logged for debugging
      
      // 显示错误提示
      showError(error, {
        id: 'query-project-roles-error'
      })
      
      throw error
    }
  },

  /**
   * 查询项目角色列表（带缓存）
   * @param projectId 项目ID
   * @param signal 取消信号（可选）
   * @returns Promise<ProjectRole[]> 角色列表
   */
  async queryProjectRolesWithCache(
    projectId: string | number,
    signal?: AbortSignal
  ): Promise<ProjectRole[]> {
    const cacheKey = `project_roles_${projectId}`
    const cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

    try {
      // 尝试从缓存获取数据
      const cachedData = this.getFromCache(cacheKey)
      if (cachedData && Date.now() - cachedData.timestamp < cacheTimeout) {
        return cachedData.data
      }

      // 缓存未命中或已过期，从API获取
      const roles = await this.queryProjectRoles(projectId, signal)
      
      // 存储到缓存
      this.setToCache(cacheKey, {
        data: roles,
        timestamp: Date.now()
      })

      return roles
    } catch (error) {
      // 如果API调用失败，尝试返回过期的缓存数据
      const cachedData = this.getFromCache(cacheKey)
      if (cachedData) {
        // API调用失败，使用缓存数据
        return cachedData.data
      }
      
      // 没有缓存数据，抛出原始错误
      throw error
    }
  },

  /**
   * 清除项目角色缓存
   * @param projectId 项目ID（可选，不传则清除所有缓存）
   */
  clearCache(projectId?: string | number): void {
    if (projectId) {
      const cacheKey = `project_roles_${projectId}`
      this.removeFromCache(cacheKey)
    } else {
      // 清除所有项目角色缓存
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('project_roles_')
      )
      keys.forEach(key => this.removeFromCache(key))
    }
  },

  /**
   * 从缓存获取数据
   * @private
   */
  getFromCache(key: string): { data: ProjectRole[]; timestamp: number } | null {
    try {
      const cached = localStorage.getItem(key)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  },

  /**
   * 存储数据到缓存
   * @private
   */
  setToCache(key: string, value: { data: ProjectRole[]; timestamp: number }): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 忽略存储错误（如存储空间不足）
    }
  },

  /**
   * 从缓存移除数据
   * @private
   */
  removeFromCache(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch {
      // 忽略移除错误
    }
  }
}

/**
 * 角色名称映射工具
 * 用于将API返回的角色名称标准化
 */
export const roleNameUtils = {
  /**
   * 标准化角色名称
   * @param roleName 原始角色名称
   * @returns 标准化后的角色名称
   */
  normalize(roleName: string): string {
    const name = roleName.trim()
    
    // 移除常见的后缀
    const suffixes = ['用户', '角色']
    let normalized = name
    
    for (const suffix of suffixes) {
      if (normalized.endsWith(suffix) && normalized.length > suffix.length) {
        normalized = normalized.slice(0, -suffix.length)
      }
    }
    
    return normalized || name // 如果处理后为空，返回原始名称
  },

  /**
   * 获取角色显示名称
   * @param roleName 角色名称
   * @returns 用于显示的角色名称
   */
  getDisplayName(roleName: string): string {
    const normalized = this.normalize(roleName)
    
    // 常见角色名称映射
    const roleMap: Record<string, string> = {
      '管理员': '管理员',
      'admin': '管理员',
      'ADMIN': '管理员',
      '成员': '成员',
      'member': '成员',
      'MEMBER': '成员',
      '所有者': '所有者',
      'owner': '所有者',
      'OWNER': '所有者',
      '观察者': '观察者',
      'viewer': '观察者',
      'VIEWER': '观察者'
    }
    
    return roleMap[normalized] || roleName
  },

  /**
   * 获取角色权重（用于排序）
   * @param roleName 角色名称
   * @returns 权重值（越大权限越高）
   */
  getWeight(roleName: string): number {
    const normalized = this.normalize(roleName).toLowerCase()
    
    const weights: Record<string, number> = {
      '所有者': 100,
      'owner': 100,
      '管理员': 80,
      'admin': 80,
      '成员': 60,
      'member': 60,
      '观察者': 40,
      'viewer': 40
    }
    
    return weights[normalized] || 50 // 默认权重
  }
}