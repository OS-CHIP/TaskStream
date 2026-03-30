import { useEffect, useState } from 'react'
import { ChevronDown, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProjectSwitcherTriggerProps } from './types'

export function ProjectSwitcherTrigger({
  currentProject,
  isOpen,
  disabled = false,
  className
}: ProjectSwitcherTriggerProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        // 基础样式
        'flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors',
        // hover效果
        'hover:bg-accent hover:text-accent-foreground',
        // focus效果
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        // disabled状态
        'disabled:pointer-events-none disabled:opacity-50',
        // 打开状态
        isOpen && 'bg-accent text-accent-foreground',
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={currentProject ? `当前项目: ${currentProject.name}` : '选择项目'}
    >
      {/* 左侧内容 */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {/* 项目图标 */}
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-sm">
          {currentProject?.avatar || <FolderOpen className="h-4 w-4" />}
        </div>
        
        {/* 项目信息 */}
        <div className="flex min-w-0 flex-1 flex-col items-start">
          {currentProject ? (
            <>
              {/* 项目名称 */}
              <span className="max-w-[140px] truncate font-medium">
                {currentProject.name}
              </span>
              
              {/* 项目状态 */}
              {currentProject.status === 'archived' && (
                <span className="text-xs text-muted-foreground truncate">
                  已归档
                </span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground truncate">
              选择项目
            </span>
          )}
        </div>
      </div>
      
      {/* 右侧箭头 */}
      <ChevronDown 
        className={cn(
          'h-4 w-4 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} 
      />
    </button>
  )
}

/**
 * 紧凑版项目切换器触发器
 * 
 * @description 适用于空间有限的场景
 */
export function CompactProjectSwitcherTrigger({
  currentProject,
  isOpen,
  disabled = false,
  className
}: ProjectSwitcherTriggerProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1.5 text-sm transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isOpen && 'bg-accent text-accent-foreground',
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={currentProject ? `当前项目: ${currentProject.name}` : '选择项目'}
    >
      {/* 项目图标 */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center text-xs">
        {currentProject?.avatar || <FolderOpen className="h-3 w-3" />}
      </div>
      
      {/* 项目名称（截断） */}
      <span className="max-w-[120px] truncate font-medium">
        {currentProject?.name || '选择项目'}
      </span>
      
      {/* 箭头 */}
      <ChevronDown 
        className={cn(
          'h-3 w-3 shrink-0 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} 
      />
    </button>
  )
}

/**
 * 图标版项目切换器触发器
 * 
 * @description 仅显示图标，适用于侧边栏收起状态
 */
export function IconProjectSwitcherTrigger({
  currentProject,
  isOpen,
  disabled = false,
  className
}: ProjectSwitcherTriggerProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        isOpen && 'bg-accent text-accent-foreground',
        className
      )}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-label={currentProject ? `当前项目: ${currentProject.name}` : '选择项目'}
      title={currentProject?.name || '选择项目'}
    >
      {/* 项目图标 */}
      <div className="flex items-center justify-center text-lg">
        {currentProject?.avatar || <FolderOpen className="h-4 w-4" />}
      </div>
    </button>
  )
}

export function ProjectSwitcherTriggerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between rounded-lg border border-border bg-background px-3 py-2',
        className
      )}
    >
      {/* 左侧骨架 */}
      <div className="flex flex-1 items-center gap-3">
        <div className="h-6 w-6 animate-pulse rounded-md bg-muted" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
      </div>
      
      {/* 右侧箭头骨架 */}
      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
    </div>
  )
}

export function ResponsiveProjectSwitcherTrigger(props: ProjectSwitcherTriggerProps) {
  const [width, setWidth] = useState<number>(() => (typeof window !== 'undefined' ? window.innerWidth : 1024))
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  if (width >= 768) {
    return <ProjectSwitcherTrigger {...props} />
  }
  if (width >= 640) {
    return <CompactProjectSwitcherTrigger {...props} />
  }
  return <IconProjectSwitcherTrigger {...props} />
}
