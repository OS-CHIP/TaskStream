// 项目管理 类型定义

export type Status = '1' | '2'
export type Role = 'OWNER' | 'ADMIN' | 'MEMBER'

export interface Project {
  id: string
  name: string
  description?: string
  status: Status
  created_at: string
  updated_at: string
  members_count: number
  owner: {
    id: string
    name: string
    email: string
  }
  key?: string
  visibility?: Visibility
  createdAt?: string
  updatedAt?: string
}

export type Visibility = 'public' | 'private' | 'internal'

export interface ProjectMember {
  id: string
  projectId: string
  userId: string
  name?: string
  avatarUrl?: string
  role: Role
  joinedAt: string
}

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED'
export type InviteMethod = 'email' | 'username'

export interface Invite {
  id: string
  projectId: string
  inviterId: string
  target: string
  method: InviteMethod
  status: InviteStatus
  token?: string
  expiredAt?: string
}

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface ProjectQuery {
  q?: string
  status?: Status
  page?: number
  limit?: number
}

// === 新增：项目角色相关类型定义 ===

/**
 * 项目角色接口
 * 用于动态获取项目角色信息
 */
export interface ProjectRole {
  /** 角色ID */
  roleId: number
  /** 角色名称 */
  roleName: string
}

/**
 * 查询项目角色请求参数
 */
export interface QueryProjectRolesRequest {
  /** 项目ID */
  projectId: string | number
}

/**
 * 查询项目角色API响应数据
 */
export interface QueryProjectRolesResponseData {
  /** 角色列表 */
  data: ProjectRole[]
}

/**
 * 查询项目角色API完整响应
 */
export interface QueryProjectRolesResponse {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: ProjectRole[]
}

/**
 * 角色选择选项（用于UI组件）
 */
export interface RoleOption {
  /** 选项值（角色ID） */
  value: string
  /** 选项标签（角色名称） */
  label: string
  /** 角色ID */
  roleId: number
  /** 角色名称 */
  roleName: string
}

/**
 * 角色数据加载状态
 */
export type RoleLoadingState = 'idle' | 'loading' | 'success' | 'error'

/**
 * 角色数据Hook返回值
 */
export interface UseProjectRolesReturn {
  /** 角色列表 */
  roles: ProjectRole[]
  /** 角色选项列表（用于下拉框） */
  roleOptions: RoleOption[]
  /** 加载状态 */
  loadingState: RoleLoadingState
  /** 是否正在加载 */
  isLoading: boolean
  /** 是否有错误 */
  isError: boolean
  /** 是否成功 */
  isSuccess: boolean
  /** 是否为空 */
  isEmpty: boolean
  /** 错误信息 */
  error: string | null
  /** 重试次数 */
  retryCount: number
  /** 是否可以重试 */
  canRetry: boolean
  /** 最大重试次数 */
  maxRetryCount: number
  /** 重试获取数据 */
  retry: () => Promise<void>
  /** 手动刷新数据 */
  refresh: () => Promise<void>
  /** 清除错误 */
  clearError: () => void
  /** 清除缓存 */
  clearCache: () => void
}

/**
 * 邀请表单数据（扩展现有Invite接口）
 */
export interface InviteFormData extends Omit<Invite, 'id' | 'status' | 'token' | 'expiredAt'> {
  /** 选中的角色ID */
  roleId?: number
  /** 选中的角色名称 */
  roleName?: string
}
