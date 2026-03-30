import Cookies from 'js-cookie'
import { Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { cn } from '@/lib/utils'
import { SearchProvider } from '@/context/search-context'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/app-sidebar'
import SkipToMain from '@/components/skip-to-main'
import { useAuthStore } from '@/stores/authStore'
import { projectsService } from '@/features/projects/services/projects.service'
import { useProjectsQuery } from '@/components/layout/project-switcher/use-projects-query'
import { Button } from '@/components/ui/button'
import { FolderOpen } from 'lucide-react'

interface Props {
  children?: React.ReactNode
}

export function AuthenticatedLayout({ children }: Props) {
  const defaultOpen = Cookies.get('sidebar_state') !== 'false'
  const userId = useAuthStore((s) => s.auth.userInfo?.id)
  const setIsProjectOwner = useAuthStore((s) => s.auth.setIsProjectOwner)
  const { projects, isLoading } = useProjectsQuery()
  const navigate = useNavigate()
  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const shouldShowGuide = (!isLoading && projects.length === 0) && !pathname.startsWith('/projects')
  const computingRef = useRef(false)
  useEffect(() => {
    if (!userId || computingRef.current) return
    computingRef.current = true
    let canceled = false
    const checkOwner = async () => {
      try {
        const selectedId = typeof window !== 'undefined' ? (localStorage.getItem('selected_project_id') || '') : ''
        const res = await projectsService.list({ status: '1', pageSize: 9999 })
        const uid = String(userId)
        const selected = (res.items || []).find(p => String(p.id) === String(selectedId))
        const nextIsOwner = !!selected && String(selected.owner?.id) === uid
        if (!canceled) setIsProjectOwner(nextIsOwner)
      } catch {
        if (!canceled) setIsProjectOwner(false)
      } finally {
        computingRef.current = false
      }
    }
    checkOwner()
    return () => { canceled = true }
  }, [userId])
  return (
    <AuthGuard>
      <SearchProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <SkipToMain />
          <AppSidebar />
          <div
            id='content'
            className={cn(
              'ml-auto w-full max-w-full',
              'peer-data-[state=collapsed]:w-[calc(100%-var(--sidebar-width-icon)-1rem)]',
              'peer-data-[state=expanded]:w-[calc(100%-var(--sidebar-width))]',
              'sm:transition-[width] sm:duration-200 sm:ease-linear',
              'flex h-svh flex-col',
              'group-data-[scroll-locked=1]/body:h-full',
              'has-[main.fixed-main]:group-data-[scroll-locked=1]/body:h-svh'
            )}
          >
            {shouldShowGuide ? (
              <div className="flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-md space-y-4 text-center">
                  <div className="flex justify-center">
                    <FolderOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">暂无项目</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      请先创建一个项目以开始使用
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <Button onClick={() => navigate({ to: '/projects', replace: true })}>
                      创建项目
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              children ? children : <Outlet />
            )}
          </div>
        </SidebarProvider>
      </SearchProvider>
    </AuthGuard>
  )
}
