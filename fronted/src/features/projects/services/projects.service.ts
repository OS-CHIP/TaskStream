import { apiClient } from '@/lib/api-client'
import type { Project, ProjectMember, Status, ProjectRole } from '../types'
import { rolesService } from './roles.service'

// 排序类型
type Order = 'asc' | 'desc'

// 列表查询参数
type ListParams = {
  q?: string
  status?: Status
  page?: number
  pageSize?: number
  sortBy?: keyof Project
  order?: Order
}

// 列表返回
type ListResult = {
  items: Project[]
  total: number
}

// 创建项目输入
type CreateInput = {
  projectName: string
  description?: string
  status?: string
  parentId?: string
}

// 更新项目输入
type UpdateInput = Partial<Pick<Project, 'name' | 'description' | 'status'>>

// 邀请用户输入
type InviteUserInput = {
  id: string
  userNameOrEmail: string
  roleId: string
}

// 邀请用户响应
type InviteUserResponse = {
  code: number
  msg: string
  data: unknown
}

// API 返回数据（仅 data 部分的类型）
type CreateProjectResponseData = null
type CreateSubProjectOaResponseData = {
  id?: number
}

type ListProjectsResponseData = Array<{
  createBy: number | null
  createTime: string
  updateBy: number | null
  updateTime: string | null
  id: number
  owner?: number | null
  projectName: string
  picAddr: string | null
  status: string
  description: string
  inviteCode: string
  isDeleted: number | null
}>

type ProjectDetailResponseData = {
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
  id: number
  projectName: string
  picAddr: string | null
  status: string
  description: string
  inviteCode: string
  isDeleted: number
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function nowISO() {
  return new Date().toISOString()
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function mapApiStatusToStatus(apiStatus: string): Status {
  return apiStatus === '1' ? '1' : '2'
}

function mapStatusToApiStatus(status: Status): string {
  return status === '1' ? '1' : '0'
}

export const projectsService = {
  /**
   * 获取项目列表
   */
  async list(params: ListParams): Promise<ListResult> {
    try {
      // 构建请求体参数
      const requestBody: Record<string, unknown> = {}
      if (params?.q) requestBody.q = params.q
      if (params?.status) requestBody.status = mapStatusToApiStatus(params.status)

      const response = await apiClient.postFormData<ListProjectsResponseData>('/project/queryParticipatedProjects', requestBody)
      // 顶层 code/msg
      if (response.code !== 200) {
        throw new Error(response.msg || '获取项目列表失败')
      }

      // 转换API数据为内部Project格式
      const projects: Project[] = (response.data || []).map(item => ({
        id: item.id != null ? String(item.id) : uuid(), // 转换为字符串ID
        name: item.projectName,
        key: slugify(item.projectName),
        description: item.description || '',
        status: mapApiStatusToStatus(item.status),
        created_at: item.createTime,
        updated_at: item.updateTime || item.createTime,
        members_count: 0, // API中没有此字段，使用默认值
        owner: {
          id: item.owner != null ? String(item.owner) : 'unknown',
          name: 'Unknown User',
          email: 'unknown@example.com'
        },
        visibility: 'private', // 添加默认可见性
        createdAt: item.createTime,
        updatedAt: item.updateTime || item.createTime,
      }))

      // 应用本地过滤和排序（如果API不支持）
      let filteredProjects = projects
      
      // 搜索过滤
      if (params?.q && params.q.trim()) {
        const searchTerm = params.q.trim().toLowerCase()
        filteredProjects = filteredProjects.filter(p => 
          p.name.toLowerCase().includes(searchTerm) || 
          p.key?.toLowerCase().includes(searchTerm) ||
          (p.description && p.description.toLowerCase().includes(searchTerm))
        )
      }

      // 状态过滤
      if (params?.status) {
        filteredProjects = filteredProjects.filter(p => p.status === params.status)
      }

      // 排序
      if (params?.sortBy && params?.order) {
        filteredProjects.sort((a: Project, b: Project) => {
          const av = a[params.sortBy!]
          const bv = b[params.sortBy!]
          if (av === bv) return 0
          if (typeof av === 'string' && typeof bv === 'string') {
            const res = av > bv ? 1 : -1
            return params.order === 'asc' ? res : -res
          }
          if (typeof av === 'number' && typeof bv === 'number') {
            const res = av > bv ? 1 : -1
            return params.order === 'asc' ? res : -res
          }
          return 0
        })
      }

      // 分页
      const page = params?.page || 1
      const pageSize = params?.pageSize || 12
      const start = (page - 1) * pageSize
      const paginatedItems = filteredProjects.slice(start, start + pageSize)

      return {
        items: paginatedItems,
        total: filteredProjects.length
      }
    } catch (_error) {
      throw new Error('获取项目列表失败，请稍后重试')
    }
  },

  /**
   * 创建子项目（OA）
   * POST /task/createSubProjectOa
   */
  async createSubProjectOa(input: {
    projectParentId: string | number
    projectSubId?: string | number
    projectName: string
    description?: string
    projectDescription?: string
    startTime?: string | Date
    dueDate?: string | Date
    priority?: string | number
  }): Promise<{ id?: string }> {
    try {
      const formatDate = (v?: string | Date) => {
        if (!v) return undefined
        if (v instanceof Date) {
          const d = v
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const hh = String(d.getHours()).padStart(2, '0')
          const mm = String(d.getMinutes()).padStart(2, '0')
          const ss = String(d.getSeconds()).padStart(2, '0')
          return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
        }
        return v
      }

      const response = await apiClient.post<CreateSubProjectOaResponseData>('/task/createSubProjectOa', {
        projectParentId: input.projectParentId,
        projectSubId: input.projectSubId != null ? String(input.projectSubId) : undefined,
        projectName: input.projectName,
        description: input.description ?? '',
        projectDescription: input.projectDescription ?? '',
        startTime: formatDate(input.startTime),
        dueDate: formatDate(input.dueDate),
        priority: input.priority != null ? String(input.priority) : undefined,
      })

      if (response.code !== 200) {
        throw new Error(response.msg || '创建子项目失败')
      }

      const id = response.data?.id != null ? String(response.data.id) : undefined
      return { id }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status: number; data?: { msg?: string } }; message?: string }
      if (axiosError.response?.data?.msg) {
        throw new Error(axiosError.response.data.msg)
      } else if (axiosError.message) {
        throw new Error(axiosError.message)
      } else {
        throw new Error('创建子项目失败，请稍后重试')
      }
    }
  },

  /**
   * 同意创建/挂接子项目（OA）
   * POST /project/agreeCreateSubProject
   */
  async agreeCreateSubProject(params: {
    projectDescription: string
    projectParentId?: string | number
    projectSubId?: string | number
    projectName?: string
    owner?: string | number
    taskId?: string | number
  }): Promise<{ code: number; msg: string }> {
    const payload: Record<string, unknown> = {
      projectDescription: params.projectDescription ?? '',
      status: '101'
    }
    if (params.projectParentId != null) payload.projectParentId = params.projectParentId
    if (params.projectSubId != null) payload.projectSubId = params.projectSubId
    if (params.projectName != null) payload.projectName = params.projectName
    if (params.owner != null) payload.owner = params.owner
    if (params.taskId != null) payload.taskId = params.taskId
    const response = await apiClient.post<null>('/project/agreeCreateSubProject', payload)
    if (response.code !== 200) {
      throw new Error(response.msg || '同意创建子项目失败')
    }
    return { code: response.code, msg: response.msg || 'success' }
  },

  /**
   * 根据ID获取项目详情
   */
  async getById(id: string, signal?: AbortSignal): Promise<Project> {
    try {
      const response = await apiClient.get<ProjectDetailResponseData>(`/project/queryProjectById/${id}`, {
        signal,
        skipErrorHandler: true
      })
    
      if (response.code !== 200) {
        throw new Error(response.msg || '获取项目详情失败')
      }

      if (response.data) {
        // 将API返回的数据转换为内部Project类型
        const apiProject = response.data
        const project: Project = {
          id: apiProject.id.toString(),
          name: apiProject.projectName,
          key: slugify(apiProject.projectName),
          description: apiProject.description || '',
          status: mapApiStatusToStatus(apiProject.status),
          created_at: apiProject.createTime,
          updated_at: apiProject.updateTime || apiProject.createTime,
          members_count: 0,
          owner: {
            id: apiProject.createBy.toString(),
            name: 'Unknown User',
            email: 'unknown@example.com'
          },
          visibility: 'private',
          createdAt: apiProject.createTime,
          updatedAt: apiProject.updateTime,
        }
        return project
      }

      // 如果API没有返回项目详情，抛出错误
      const err = new Error('项目不存在') as Error & { code?: string }
      err.code = 'NOT_FOUND'
      throw err
    } catch (error: unknown) {
      const errorObj = error as { code?: string; name?: string }
      if (!(errorObj?.code === 'ERR_CANCELED' || errorObj?.name === 'CanceledError' || errorObj?.name === 'AbortError')) {
        // console.error('获取项目详情失败:', error)
      }
      
      const axiosError = error as { response?: { status: number }; code?: string }
      
      if (axiosError.response?.status === 404) {
        const err = new Error('项目不存在') as Error & { code?: string }
        err.code = 'NOT_FOUND'
        throw err
      }
      if (axiosError.code === 'NOT_FOUND') {
        throw error
      }
      const errorObj2 = axiosError as { code?: string; name?: string }
      if ((errorObj2?.code === 'ERR_CANCELED') || errorObj2?.name === 'CanceledError' || errorObj2?.name === 'AbortError') { throw error }
      const err = new Error('获取项目详情失败，请稍后重试') as Error & { code?: string }
      err.code = 'FETCH_ERROR'
      throw err
    }
  },

  /**
   * 创建项目
   */
  async create(input: CreateInput): Promise<Project> {
    try {
      const response = await apiClient.post<CreateProjectResponseData>('/project/addProject', {
        projectName: input.projectName,
        description: input.description || '',
        status: input.status ?? '1',
        parentId: input.parentId ? Number(input.parentId) : undefined
      })

      // 检查API响应
      if (response.code !== 200) {
        throw new Error(response.msg || '创建项目失败')
      }

      // 由于API返回data为null，我们需要在本地生成项目数据用于UI显示
      // 实际的项目数据应该通过重新调用列表接口获取
      const project: Project = {
        id: uuid(),
        name: input.projectName,
        key: slugify(input.projectName),
        description: input.description || '',
        status: mapApiStatusToStatus(input.status ?? '1'),
        created_at: nowISO(),
        updated_at: nowISO(),
        members_count: 1,
        owner: {
          id: 'current-user',
          name: 'Current User',
          email: 'current@example.com'
        },
        visibility: 'private',
        createdAt: nowISO(),
        updatedAt: nowISO(),
      }

      return project
    } catch (error: unknown) {
      // console.error('创建项目失败:', error)
      
      const axiosError = error as { 
        response?: { status: number; data?: { msg?: string } }; 
        message?: string 
      }
      
      // 处理不同类型的错误
      if (axiosError.response?.status === 400) {
        throw new Error('请求参数错误，请检查输入信息')
      } else if (axiosError.response?.status === 409) {
        throw new Error('项目名称已存在，请使用其他名称')
      } else if (axiosError.response?.data?.msg) {
        throw new Error(axiosError.response.data.msg)
      } else if (axiosError.message) {
        throw new Error(axiosError.message)
      } else {
        throw new Error('创建项目失败，请稍后重试')
      }
    }
  },

  /**
   * 更新项目
   */
  async update(id: string, patch: UpdateInput): Promise<Project> {
    try {
      const response = await apiClient.post<ProjectDetailResponseData>(`/project/updateProject`, {
        id: parseInt(id),
        projectName: patch.name,
        picAddr: null,
        description: patch.description,
        status: patch.status ? mapStatusToApiStatus(patch.status) : '1'
      })

      if (response.code !== 200) {
        throw new Error(response.msg || '更新项目失败')
      }

      // data 可能为 null（接口仅返回 { code, msg, data: null }）
      const apiProject = response.data
      let project: Project
      if (apiProject) {
        project = {
          id: apiProject.id.toString(),
          name: apiProject.projectName,
          key: slugify(apiProject.projectName),
          description: apiProject.description || '',
          status: mapApiStatusToStatus(apiProject.status),
          created_at: apiProject.createTime,
          updated_at: apiProject.updateTime,
          members_count: 0,
          owner: {
            id: apiProject.createBy.toString(),
            name: 'Unknown User',
            email: 'unknown@example.com'
          },
          visibility: 'private',
          createdAt: apiProject.createTime,
          updatedAt: apiProject.updateTime,
        }
      } else {
        // 回退：API没有返回实体，构造一个本地更新后的项目对象用于UI显示
        const name = patch.name ?? `project-${id}`
        const now = nowISO()
        project = {
          id: id,
          name,
          key: slugify(name),
          description: patch.description || '',
          status: patch.status ? patch.status : '1',
          created_at: now, // 无法从API获取，使用当前时间占位
          updated_at: now,
          members_count: 0,
          owner: {
            id: 'unknown',
            name: 'Unknown User',
            email: 'unknown@example.com'
          },
          visibility: 'private',
          createdAt: now,
          updatedAt: now,
        }
      }

      return project
    } catch (error: unknown) {
      // console.error('更新项目失败:', error)
      
      const axiosError = error as { response?: { status: number } }
      
      if (axiosError.response?.status === 404) {
        const err = new Error('项目不存在') as Error & { code?: string }
        err.code = 'NOT_FOUND'
        throw err
      }
      throw new Error('更新项目失败，请稍后重试')
    }
  },

  /**
   * 删除项目
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.get<CreateProjectResponseData>(`/project/deleteProject/${id}`)
      
      if (response.code !== 200) {
        throw new Error(response.msg || '删除项目失败')
      }
    } catch (error: unknown) {
      // console.error('删除项目失败:', error)
      
      const axiosError = error as { response?: { status: number } }
      
      if (axiosError.response?.status === 404) {
        // 项目不存在，可以认为删除成功
        return
      }
      throw new Error('删除项目失败，请稍后重试')
    }
  },

  /**
   * 获取项目成员列表
   */
  async listMembers(projectId: string, signal?: AbortSignal): Promise<ProjectMember[]> {
    try {
      const response = await apiClient.postFormData<Array<{
        email: string,
        userName: string,
        roleName: string
      }>>(`/project/queryProjectUsersByName`, {
        id: parseInt(projectId),
        userName: '' // 空字符串表示查询所有成员
      }, {
        signal,
        skipErrorHandler: true
      })

      if (response.code !== 200) {
        throw new Error(response.msg || '获取项目成员失败')
      }

      // 将API返回的数据转换为内部ProjectMember类型
      interface ApiMember {
        email: string
        userName: string
        roleName: string
      }
      
      const members: ProjectMember[] = (response.data || []).map((apiMember: ApiMember, index: number) => ({
        id: `${projectId}_${index}`, // 生成唯一ID
        userId: apiMember.email, // 使用email作为userId，因为API没有返回真正的userId
        projectId: projectId,
        name: apiMember.userName, // 直接使用userName作为name字段
        role: mapRoleNameToRole(apiMember.roleName),
        joinedAt: new Date().toISOString(), // API没有返回加入时间，使用当前时间
        user: {
          id: apiMember.email, // 使用email作为用户ID
          name: apiMember.userName,
          email: apiMember.email,
          avatar: null
        }
      }))

      return members
    } catch (error: unknown) {
      const errorObj = error as { code?: string; name?: string }
      if (!(errorObj?.code === 'ERR_CANCELED' || errorObj?.name === 'CanceledError' || errorObj?.name === 'AbortError')) {
        // console.error('获取项目成员失败:', error)
      }
      // 如果API失败，返回空数组而不是抛出错误
      return []
    }
  },

  /**
   * 获取项目角色列表
   */
  async listProjectRoles(projectId: string, signal?: AbortSignal): Promise<ProjectRole[]> {
    try {
      return await rolesService.queryProjectRoles(projectId, signal)
    } catch (error: unknown) {
      const errorObj = error as { code?: string; name?: string }
      if (!(errorObj?.code === 'ERR_CANCELED' || errorObj?.name === 'CanceledError' || errorObj?.name === 'AbortError')) {
        // console.error('获取项目角色失败:', error)
      }
      throw error
    }
  },

  /**
   * 获取项目角色列表（带缓存）
   */
  async listProjectRolesWithCache(projectId: string, signal?: AbortSignal): Promise<ProjectRole[]> {
    try {
      return await rolesService.queryProjectRolesWithCache(projectId, signal)
    } catch (error: unknown) {
      const errorObj = error as { code?: string; name?: string }
      if (!(errorObj?.code === 'ERR_CANCELED' || errorObj?.name === 'CanceledError' || errorObj?.name === 'AbortError')) {
        // console.error('获取项目角色失败:', error)
      }
      throw error
    }
  },

  /**
   * 清除项目角色缓存
   */
  clearProjectRolesCache(projectId?: string): void {
    rolesService.clearCache(projectId)
  },

  /**
   * 邀请用户加入项目
   */
  async inviteUser(params: InviteUserInput): Promise<InviteUserResponse> {
    try {
      const response = await apiClient.postFormData<unknown>('/project/inviteUser', {
        id: params.id,
        userNameOrEmail: params.userNameOrEmail,
        roleId: params.roleId
      })

      // 检查API响应
      if (response.code !== 200) {
        throw new Error(response.msg || '邀请用户失败')
      }

      return response
    } catch (error: unknown) {
      // console.error('邀请用户失败:', error)
      
      const axiosError = error as { 
        response?: { status: number; data?: { msg?: string } }; 
        message?: string 
      }
      
      // 处理不同类型的错误
      if (axiosError.response?.status === 400) {
        throw new Error('请求参数错误，请检查输入信息')
      } else if (axiosError.response?.status === 404) {
        throw new Error('项目或用户不存在')
      } else if (axiosError.response?.data?.msg) {
        throw new Error(axiosError.response.data.msg)
      } else if (axiosError.message) {
        throw new Error(axiosError.message)
      } else {
        throw new Error('邀请用户失败，请稍后重试')
      }
    }
  },

  /**
   * 从项目中移除用户
   */
  async removeProjectUser(data: {
    projectId: string;
    userId: string;
  }): Promise<void> {
    const response = await apiClient.postFormData('/project/removeProjectUser', {
      projectId: data.projectId,
      userId: data.userId,
    });

    if (response.code !== 200) {
      throw new Error(response.msg || 'Failed to remove user from project');
    }
  }
}

// 辅助函数：将API返回的角色名称映射为内部Role类型
function mapRoleNameToRole(roleName: string): 'OWNER' | 'ADMIN' | 'MEMBER' {
  switch (roleName) {
    case '管理员用户':
    case '管理员':
    case 'ADMIN':
      return 'ADMIN'
    case '项目所有者':
    case '所有者':
    case 'OWNER':
      return 'OWNER'
    case '普通用户':
    case '成员':
    case 'MEMBER':
    default:
      return 'MEMBER'
  }
}
