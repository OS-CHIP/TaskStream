import { apiClient } from '@/lib/api-client'
import type { BackendApiResponse } from '@/lib/types/api'
import type { AuthUser } from '@/stores/authStore'
import { removeCookie } from '@/utils/cookie'

// 注册请求类型
export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
}

// 注册响应类型
export interface RegisterResponse {
  user: AuthUser
  accessToken: string
  message: string
}

 // 登录请求类型
export interface LoginRequest {
  username: string
  password: string
}

// 登录响应类型
export interface LoginResponse {
  user: AuthUser
  accessToken: string
  message: string
}

// 用户详细信息类型
export interface UserInfo {
  id: number
  deptId: number
  userName: string
  nickName: string
  userType: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  password: string
  status: string
  delFlag: string
  loginIp: string
  loginDate: string | null
  createBy: string
  createTime: string | null
  updateBy: string
  updateTime: string | null
  remark: string | null
}

// 获取用户信息响应数据类型
export interface GetUserInfoData {
  user: UserInfo
  permissions: string[] | null
  roles: string[] | null
}

// 获取用户信息响应类型
export type GetUserInfoResponse = BackendApiResponse<GetUserInfoData>

/**
 * 用户注册
 * @param data 注册数据
 * @returns 注册结果
 */
export const register = async (
  data: RegisterRequest
): Promise<BackendApiResponse<RegisterResponse>> => {
  // 验证输入数据
  if (!data.username || !data.email || !data.password || !data.confirmPassword) {
    throw new Error('用户名、邮箱、密码和确认密码不能为空')
  }

  if (data.password !== data.confirmPassword) {
    throw new Error('密码和确认密码不匹配')
  }

  if (data.password.length < 6) {
    throw new Error('密码长度不能少于6位')
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.email)) {
    throw new Error('邮箱格式不正确')
  }

  const payload = {
    username: data.username,
    email: data.email,
    password: data.password,
  }
  return await apiClient.post<RegisterResponse>(
    '/users/register',
    payload,
    { skipAuth: true }
  )
}

/**
 * 用户登录
 * @param data 登录数据
 * @returns 登录结果
 */
export const doLogin = async (
  data: LoginRequest
): Promise<BackendApiResponse<LoginResponse>> => {
  // 验证输入数据
  if (!data.username || !data.password) {
    throw new Error('用户名和密码不能为空')
  }

  // 调用绝对地址登录接口，传 JSON，跳过认证
  return await apiClient.post<LoginResponse>(
    '/users/doLogin',
    { username: data.username, password: data.password },
    { skipAuth: true }
  )
}

/**
 * 获取用户信息
 * @returns 用户信息结果
 */
export const getUserInfo = async (): Promise<GetUserInfoResponse> => {
  try {
    // 调用API获取用户信息，token会通过http-client拦截器自动携带
    const response = await apiClient.get<GetUserInfoData>('/users/getInfo')
    
    // 直接返回API响应，包含 code/msg/data
    return response
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('获取用户信息失败:', error)
    // 重新抛出错误，让调用方处理
    throw error
  }
}

/**
 * 用户退出登录
 * @returns 退出登录结果
 */
export const logout = async (): Promise<BackendApiResponse<{ message: string }>> => {
  try {
    const res = await apiClient.get<{ message: string }>(
      '/users/logout'
    )
    return res
  } finally {
    try {
      // 清理本地存储
      if (typeof localStorage !== 'undefined') localStorage.clear()
      if (typeof sessionStorage !== 'undefined') sessionStorage.clear()

      // 清理token cookie
      removeCookie('token')
      
      // 清理其他可见 cookies（当前域）
      if (typeof document !== 'undefined' && document.cookie) {
        const cookies = document.cookie.split(';')
        for (const c of cookies) {
          const eqPos = c.indexOf('=')
          const name = (eqPos > -1 ? c.slice(0, eqPos) : c).trim()
          if (name !== 'token') { // token已经通过removeCookie清理
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
          }
        }
      }
    } catch (cleanupError) {
      // 忽略清理过程中的错误，确保后续逻辑能够执行
      // eslint-disable-next-line no-console
      console.warn('清理存储时发生错误:', cleanupError)
    }
    // 跳转到登录页
    if (typeof window !== 'undefined') {
      window.location.assign('/sign-in')
    }
  }
}
