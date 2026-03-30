import Cookies from 'js-cookie'
import { create } from 'zustand'
import { getCookie } from '@/utils/cookie'
import type { UserInfo } from '@/features/auth/services/auth-service'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_INFO_KEY = 'user_info_cache'
const IS_OWNER_KEY = 'is_project_owner_cache'

export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    userInfo: UserInfo | null
    setUserInfo: (userInfo: UserInfo | null) => void
    isProjectOwner: boolean
    setIsProjectOwner: (isOwner: boolean) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
    clearUserInfo: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  const initToken = cookieState ? (() => {
    try {
      return JSON.parse(cookieState)
    } catch {
      return ''
    }
  })() : ''
  // 从localStorage获取缓存的用户信息
  const getCachedUserInfo = (): UserInfo | null => {
    try {
      const cached = localStorage.getItem(USER_INFO_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }
  const getCachedIsOwner = (): boolean => {
    try {
      const cached = localStorage.getItem(IS_OWNER_KEY)
      if (!cached) return false
      const parsed = JSON.parse(cached) as { userId?: string | number; isOwner?: boolean }
      const currentUserId = getCachedUserInfo()?.id
      if (parsed && parsed.userId != null && currentUserId != null && String(parsed.userId) === String(currentUserId)) {
        return !!parsed.isOwner
      }
      return false
    } catch {
      return false
    }
  }
  
  // 缓存用户信息到localStorage
  const cacheUserInfo = (userInfo: UserInfo | null) => {
    try {
      if (userInfo) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
      } else {
        localStorage.removeItem(USER_INFO_KEY)
        localStorage.removeItem(IS_OWNER_KEY)
      }
    } catch {
      // 忽略localStorage错误
    }
  }
  
  return {
    auth: {
      user: null,
      setUser: (user) =>
        set((state) => ({ ...state, auth: { ...state.auth, user } })),
      userInfo: getCachedUserInfo(),
      setUserInfo: (userInfo) =>
        set((state) => {
          cacheUserInfo(userInfo)
          return { ...state, auth: { ...state.auth, userInfo } }
        }),
      isProjectOwner: getCachedIsOwner(),
      setIsProjectOwner: (isOwner) =>
        set((state) => {
          const uid = state.auth.userInfo?.id
          try {
            if (uid != null) {
              localStorage.setItem(IS_OWNER_KEY, JSON.stringify({ userId: uid, isOwner }))
            } else {
              localStorage.removeItem(IS_OWNER_KEY)
            }
          } catch {}
          return { ...state, auth: { ...state.auth, isProjectOwner: isOwner } }
        }),
      accessToken: initToken,
      setAccessToken: (accessToken) =>
        set((state) => {
          // Cookies.set(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      clearUserInfo: () =>
        set((state) => {
          cacheUserInfo(null)
          return { ...state, auth: { ...state.auth, userInfo: null, isProjectOwner: false } }
        }),
      reset: () =>
        set((state) => {
          Cookies.remove(ACCESS_TOKEN)
          cacheUserInfo(null)
          return {
            ...state,
            auth: { ...state.auth, user: null, userInfo: null, isProjectOwner: false, accessToken: '' },
          }
        }),
    },
  }
})

// export const useAuth = () => useAuthStore((state) => state.auth)
