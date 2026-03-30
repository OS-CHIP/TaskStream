/**
 * 项目切换器主组件
 * 
 * @description 项目切换器的核心组件，整合触发器、内容和状态管理
 * @author SOLO Document
 * @created 2024-01-20
 */

import React from 'react'
import * as Select from '@radix-ui/react-select'
import { cn } from '@/lib/utils'
import { useProjectSwitcher } from './use-project-switcher'
import { ProjectSwitcherTrigger, ResponsiveProjectSwitcherTrigger } from './project-switcher-trigger'
import { ProjectSwitcherContent } from './project-switcher-content'
import { RefreshCountdownDialog } from '@/components/refresh-countdown-dialog'
import type { ProjectSwitcherProps, Project } from './types'

/**
 * 项目切换器主组件
 * 
 * @param props 组件属性
 * @returns JSX元素
 */
export function ProjectSwitcher({
  projects,
  defaultProjectId,
  onProjectChange,
  searchPlaceholder,
  emptyMessage,
  noResultsMessage,
  disabled = false,
  variant = 'default',
  size: _size = 'default',
  className,
  triggerClassName,
  contentClassName,
  ...props
}: ProjectSwitcherProps) {
  // 使用项目切换器Hook
  const {
    currentProject,
    filteredProjects,
    searchValue,
    isOpen,
    isLoading,
    error,
    showCountdownDialog,
    handleProjectSelect,
    setSearchValue,
    setIsOpen,
    setShowCountdownDialog
  } = useProjectSwitcher({
    defaultProjectId,
    onProjectChange
  })

  // 处理搜索变化
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  // 处理下拉菜单开关
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchValue('') // 关闭时清空搜索
    }
  }

  const searchInputRef = null

  return (
    <>
      <Select.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        disabled={disabled || isLoading}
        {...props}
      >
        <Select.Trigger asChild>
          <div className={cn('w-full', className)}>
            {variant === 'responsive' ? (
              <ResponsiveProjectSwitcherTrigger
                currentProject={currentProject}
                isOpen={isOpen}
                disabled={disabled || isLoading}
                className={triggerClassName}
              />
            ) : (
              <ProjectSwitcherTrigger
                currentProject={currentProject}
                isOpen={isOpen}
                disabled={disabled || isLoading}
                className={triggerClassName}
              />
            )}
          </div>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className={cn(
              'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
              'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              contentClassName
            )}
            position="popper"
            sideOffset={4}
          >
            <ProjectSwitcherContent
              projects={filteredProjects}
              currentProject={currentProject}
              searchValue={searchValue}
              searchPlaceholder={searchPlaceholder}
              emptyMessage={emptyMessage}
              noResultsMessage={noResultsMessage}
              isLoading={isLoading}
              error={error}
              onProjectSelect={handleProjectSelect}
              onSearchChange={handleSearchChange}
              searchInputRef={searchInputRef}
            />
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      {/* 项目切换倒计时对话框 */}
      <RefreshCountdownDialog
        open={showCountdownDialog}
        onOpenChange={setShowCountdownDialog}
        title="项目切换成功"
        description={`已切换到项目 "${currentProject?.name}"，页面将自动刷新`}
        countdownSeconds={3}
      />
    </>
  )
}

/**
 * 简化版项目切换器
 * 
 * @description 提供更简单的API，适用于大多数场景
 */
export function SimpleProjectSwitcher({
  projects,
  defaultProjectId,
  onProjectChange,
  className
}: {
  projects?: Project[]
  defaultProjectId?: string
  onProjectChange?: (project: Project) => void
  className?: string
}) {
  return (
    <ProjectSwitcher
      projects={projects}
      defaultProjectId={defaultProjectId}
      onProjectChange={onProjectChange}
      className={className}
      searchPlaceholder="搜索项目..."
      emptyMessage="暂无项目"
      noResultsMessage="未找到匹配的项目"
    />
  )
}

/**
 * 紧凑版项目切换器
 * 
 * @description 适用于空间有限的场景
 */
export function CompactProjectSwitcher(props: Omit<ProjectSwitcherProps, 'size'>) {
  return (
    <ProjectSwitcher
      {...props}
      size="sm"
      variant="compact"
    />
  )
}

/**
 * 响应式项目切换器
 * 
 * @description 根据屏幕尺寸自动调整样式
 */
export function ResponsiveProjectSwitcher(props: Omit<ProjectSwitcherProps, 'variant'>) {
  return (
    <ProjectSwitcher
      {...props}
      variant="responsive"
    />
  )
}

/**
 * 项目切换器错误边界
 */
class ProjectSwitcherErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error logged for debugging purposes
    // console.error('ProjectSwitcher Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            项目切换器加载失败
          </div>
        )
      )
    }

    return this.props.children
  }
}

/**
 * 带错误边界的项目切换器
 */
export function SafeProjectSwitcher(props: ProjectSwitcherProps & { fallback?: React.ReactNode }) {
  const { fallback, ...switcherProps } = props
  
  return (
    <ProjectSwitcherErrorBoundary fallback={fallback}>
      <ProjectSwitcher {...switcherProps} />
    </ProjectSwitcherErrorBoundary>
  )
}

// 导出所有组件
export {
  ProjectSwitcherTrigger,
  ResponsiveProjectSwitcherTrigger
} from './project-switcher-trigger'

export {
  ProjectSwitcherContent
} from './project-switcher-content'

export {
  ProjectItem,
  ProjectList
} from './project-item'

export {
  useProjectSwitcher,
  useProjectSearch,
  useProjectState
} from './use-project-switcher'

export * from './types'

// 默认导出
export default ProjectSwitcher