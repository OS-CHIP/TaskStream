import React from 'react'
import { cn } from '@/lib/utils'

interface TaskDetailLayoutProps {
  children: React.ReactNode
  className?: string
}

interface TaskDetailMainProps {
  children: React.ReactNode
  className?: string
}

interface TaskDetailSidebarProps {
  children: React.ReactNode
  className?: string
}

/**
 * 任务详情页面主布局组件
 * 实现响应式设计：桌面端双栏布局，移动端单栏布局
 */
export function TaskDetailLayout({ children, className }: TaskDetailLayoutProps) {
  return (
    <div className={cn(
      'min-h-screen bg-background',
      'flex flex-col lg:flex-row',
      'gap-0 lg:gap-6',
      'p-4 lg:p-6',
      className
    )}>
      {children}
    </div>
  )
}

/**
 * 任务详情主内容区域
 * 包含任务头部、基本信息、描述、子任务等主要内容
 */
export function TaskDetailMain({ children, className }: TaskDetailMainProps) {
  return (
    <main className={cn(
      'flex-1',
      'min-w-0', // 防止flex子元素溢出
      'space-y-6',
      'order-1 lg:order-1',
      className
    )}>
      {children}
    </main>
  )
}

/**
 * 任务详情侧边栏
 * 包含附件、时间线、评论等辅助信息
 */
export function TaskDetailSidebar({ children, className }: TaskDetailSidebarProps) {
  return (
    <aside className={cn(
      'w-full lg:w-80 xl:w-96',
      'flex-shrink-0',
      'space-y-6',
      'order-2 lg:order-2',
      'mt-6 lg:mt-0',
      className
    )}>
      {children}
    </aside>
  )
}

/**
 * 内容卡片容器
 * 为各个功能模块提供统一的卡片样式
 */
interface TaskDetailCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
  action?: React.ReactNode
}

export function TaskDetailCard({ 
  children, 
  className, 
  title, 
  description, 
  action 
}: TaskDetailCardProps) {
  return (
    <div className={cn(
      'bg-card text-card-foreground',
      'border border-border',
      'rounded-lg',
      'shadow-sm',
      className
    )}>
      {(title || description || action) && (
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="space-y-1">
            {title && (
              <h3 className="text-lg font-semibold leading-none tracking-tight">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {action && (
            <div className="flex items-center space-x-2">
              {action}
            </div>
          )}
        </div>
      )}
      <div className={cn(
        'p-4',
        (title || description || action) && 'pt-2'
      )}>
        {children}
      </div>
    </div>
  )
}

/**
 * 响应式网格容器
 * 用于在不同屏幕尺寸下展示网格内容
 */
interface TaskDetailGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    default?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
}

export function TaskDetailGrid({ 
  children, 
  className, 
  cols = { default: 1, md: 2, lg: 3 } 
}: TaskDetailGridProps) {
  const gridClasses = [
    'grid',
    'gap-4',
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ')

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  )
}

/**
 * 分隔线组件
 * 用于在内容区域之间添加视觉分隔
 */
interface TaskDetailDividerProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function TaskDetailDivider({ 
  className, 
  orientation = 'horizontal' 
}: TaskDetailDividerProps) {
  return (
    <div 
      className={cn(
        'bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  )
}

/**
 * 空状态组件
 * 用于显示无数据或加载状态
 */
interface TaskDetailEmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function TaskDetailEmptyState({
  title,
  description,
  icon,
  action,
  className
}: TaskDetailEmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      'py-12 px-4',
      'text-center',
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && action}
    </div>
  )
}

/**
 * 骨架屏组件
 * 用于数据加载时的占位显示
 */
interface TaskDetailSkeletonProps {
  className?: string
  lines?: number
  showAvatar?: boolean
}

export function TaskDetailSkeleton({ 
  className, 
  lines = 3, 
  showAvatar = false 
}: TaskDetailSkeletonProps) {
  return (
    <div className={cn('animate-pulse space-y-3', className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-3 bg-muted rounded w-16" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div 
            key={i} 
            className={cn(
              'h-4 bg-muted rounded',
              i === lines - 1 ? 'w-3/4' : 'w-full'
            )} 
          />
        ))}
      </div>
    </div>
  )
}