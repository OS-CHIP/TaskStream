import { createFileRoute, redirect } from '@tanstack/react-router'
import SignIn from '@/features/auth/sign-in'
import { getCookie } from '@/utils/cookie'

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: () => {
    const hasToken = getCookie('token')
    if (hasToken) {
      throw redirect({ to: '/tasks', replace: true })
    }
  },
  component: SignIn,
})
