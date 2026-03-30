import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getCookie } from '@/utils/cookie'
import { useAuthStore } from '@/stores/authStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  useEffect(() => {
    // 检查cookie中是否存在token
    const token = getCookie('token')
    
    if (!token) {
      // 如果没有token，跳转到登录页面
      navigate({ 
        to: '/sign-in',
        search: { redirect: window.location.pathname }
      })
      return
    }

    // 如果store中没有accessToken但cookie中有，更新store
    if (!auth.accessToken && token) {
      auth.setAccessToken(token)
    }
  }, [navigate, auth])

  // 如果没有token，不渲染子组件
  const token = getCookie('token')
  if (!token) {
    return null
  }

  return <>{children}</>
}