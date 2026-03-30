/**
 * 项目加载器组件
 * 
 * @description 等待项目数据加载完成并设置默认项目，然后重定向到目标页面
 * @author SOLO Coding
 * @created 2024-01-20
 */

import React, { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, AlertCircle, FolderOpen } from 'lucide-react'
import { useProjectsQuery } from '@/components/layout/project-switcher/use-projects-query'
import { selectedProjectCacheManager } from '@/components/layout/project-switcher/use-project-switcher'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface ProjectLoaderProps {
  /** 项目加载完成后要重定向到的路径 */
  redirectTo?: string
  /** 加载失败时的回调 */
  onError?: (error: string) => void
  /** 自定义加载文本 */
  loadingText?: string
  /** 自定义错误文本 */
  errorText?: string
}

export function ProjectLoader({
  redirectTo = '/tasks',
  onError,
  loadingText = '正在加载项目数据...',
  errorText = '加载项目数据失败'
}: ProjectLoaderProps) {
  const navigate = useNavigate()
  const { projects, isLoading, error } = useProjectsQuery()
  const [hasRedirected, setHasRedirected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // 处理项目加载完成后的逻辑
  useEffect(() => {
    // 如果已经重定向过，不再处理
    if (hasRedirected) return

    // 如果还在加载中，等待
    if (isLoading) return

    // 如果有错误，处理错误
    if (error) {
      console.error('项目数据加载失败:', error)
      if (onError) {
        onError(error)
      }
      return
    }

    // 如果项目列表为空
    if (projects.length === 0) {
      console.warn('没有可用的项目')
      return
    }

    // 检查是否已有选中的项目
    const cachedProjectId = selectedProjectCacheManager.getCachedSelectedProjectId()
    let targetProject = null

    if (cachedProjectId) {
      // 尝试找到缓存的项目
      targetProject = projects.find(p => p.id === cachedProjectId)
      console.log('从缓存恢复项目:', { cachedProjectId, found: !!targetProject })
    }

    // 如果没有找到缓存的项目，选择第一个项目
    if (!targetProject && projects.length > 0) {
      targetProject = projects[0]
      console.log('选择第一个项目作为默认项目:', { projectId: targetProject.id, projectName: targetProject.name })
    }

    // 设置选中的项目ID到localStorage
    if (targetProject) {
      selectedProjectCacheManager.setCachedSelectedProjectId(targetProject.id)
      console.log('项目ID已设置到localStorage:', targetProject.id)
      
      // 标记已重定向，避免重复处理
      setHasRedirected(true)
      
      // 短暂延迟后重定向，确保localStorage写入完成
      setTimeout(() => {
        console.log('重定向到:', redirectTo)
        navigate({ to: redirectTo, replace: true })
      }, 100)
    }
  }, [projects, isLoading, error, hasRedirected, redirectTo, navigate, onError])

  // 重试加载
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    window.location.reload()
  }

  // 如果有错误，显示错误界面
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {errorText}: {error}
            </AlertDescription>
          </Alert>
          
          <div className="flex justify-center">
            <Button onClick={handleRetry} variant="outline">
              重试 {retryCount > 0 && `(${retryCount})`}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 如果项目列表为空且不在加载中
  if (!isLoading && projects.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="flex justify-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">暂无项目</h2>
            <p className="text-sm text-muted-foreground mt-1">
              您还没有任何项目，请先创建一个项目
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={() => navigate({ to: '/projects', replace: true })}>
              创建项目
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 显示加载界面
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{loadingText}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            正在初始化项目环境...
          </p>
        </div>
        
        {/* 进度指示器 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>加载项目列表</span>
            <span>{isLoading ? '进行中...' : '已完成'}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: isLoading ? '60%' : '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 项目加载器错误边界
 */
export class ProjectLoaderErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean; error: Error } {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ProjectLoader Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Alert className="border-red-200 bg-red-50 max-w-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              项目加载器发生错误，请刷新页面重试
            </AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}