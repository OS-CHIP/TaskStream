/**
 * 项目选项组件
 * 
 * @description 渲染单个项目选项，支持选中状态、hover效果和搜索高亮
 * @author SOLO Document
 * @created 2024-01-20
 */

import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ProjectItemProps } from './types'

function stripTrailingDate(text: string) {
  if (!text) return ''
  let t = text
  t = t.replace(/\s*[-_ ]?\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?\s*$/u, '')
  t = t.replace(/\s*[-_ ]?\d{8}(?:\d{6})?\s*$/u, '')
  t = t.replace(/\s*[\(\[]\d{4}[-/ ]?\d{2}[-/ ]?\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?[\)\]]\s*$/u, '')
  return t.trim()
}

/**
 * 项目选项组件
 * 
 * @param props 组件属性
 * @returns JSX元素
 */
export function ProjectItem({
  project,
  isSelected,
  onSelect,
  searchValue = ''
}: ProjectItemProps) {
  // 处理点击事件
  const handleClick = () => {
    onSelect(project)
  }
  
  // 处理键盘事件
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(project)
    }
  }
  
  // 高亮搜索关键词
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text
    }
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'))
    return (
      <>
        {parts.map((part, index) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    )
  }
  
  // 项目状态指示器
  const StatusIndicator = () => {
    if (project.status === 'archived') {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          已归档
        </span>
      )
    }
    return null
  }
  
  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={0}
      className={cn(
        // 基础样式
        'flex w-full cursor-pointer items-center gap-3 rounded-sm px-2 py-2.5 text-sm transition-colors',
        // hover效果
        'hover:bg-accent hover:text-accent-foreground',
        // focus效果
        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
        // 选中状态
        isSelected && 'bg-accent text-accent-foreground',
        // 归档项目样式
        project.status === 'archived' && 'opacity-60'
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* 项目头像/图标 */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-lg">
        {project.avatar || '📁'}
      </div>
      
      {/* 项目信息 */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* 项目名称 */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate font-medium cursor-help">
                  {highlightText(project.name, searchValue)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{project.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <StatusIndicator />
        </div>
        
        {/* 项目描述 */}
        {project.description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate text-xs text-muted-foreground cursor-help">
                  {highlightText(stripTrailingDate(project.description), searchValue)}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stripTrailingDate(project.description)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* 选中指示器 */}
      {isSelected && (
        <Check className="h-4 w-4 shrink-0 text-primary" />
      )}
    </div>
  )
}

/**
 * 项目选项骨架屏组件
 * 
 * @description 用于加载状态的占位符
 */
export function ProjectItemSkeleton() {
  return (
    <div className="flex w-full items-center gap-3 rounded-sm px-2 py-2.5">
      {/* 头像骨架 */}
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-md bg-muted" />
      
      {/* 内容骨架 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </div>
    </div>
  )
}

/**
 * 空状态组件
 * 
 * @description 当没有项目时显示
 */
export function EmptyProjectsState({ message }: { message?: string } = {}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="mb-2 text-4xl">📂</div>
      <p className="text-sm font-medium text-muted-foreground">
        {message || '暂无可用项目'}
      </p>
      <p className="text-xs text-muted-foreground">
        请联系管理员添加项目
      </p>
    </div>
  )
}

/**
 * 无搜索结果状态组件
 * 
 * @description 当搜索无结果时显示
 */
export function NoSearchResultsState({ searchValue, message }: { searchValue: string; message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <div className="mb-2 text-3xl">🔍</div>
      <p className="text-sm font-medium text-muted-foreground">
        {message || '未找到匹配的项目'}
      </p>
      <p className="text-xs text-muted-foreground">
        尝试搜索 "{searchValue}" 没有找到结果
      </p>
    </div>
  )
}

/**
 * 项目列表组件
 * 
 * @description 渲染项目列表，处理各种状态
 */
export function ProjectList({
  projects,
  currentProject,
  onProjectSelect,
  searchValue = '',
  isLoading = false,
  emptyMessage,
  noResultsMessage
}: {
  projects: ProjectItemProps['project'][]
  currentProject: ProjectItemProps['project'] | null
  onProjectSelect: ProjectItemProps['onSelect']
  searchValue?: string
  isLoading?: boolean
  emptyMessage?: string
  noResultsMessage?: string
}) {
  // 加载状态
  if (isLoading) {
    return (
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <ProjectItemSkeleton key={index} />
        ))}
      </div>
    )
  }
  
  // 空状态
  if (projects.length === 0) {
    if (searchValue) {
      return <NoSearchResultsState searchValue={searchValue} message={noResultsMessage} />
    }
    return <EmptyProjectsState message={emptyMessage} />
  }
  
  // 正常列表
  return (
    <div className="space-y-1" role="listbox">
      {projects.map((project, index) => (
        <ProjectItem
          key={`${project.id}-${index}`}
          project={project}
          isSelected={currentProject?.id === project.id}
          onSelect={onProjectSelect}
          searchValue={searchValue}
        />
      ))}
    </div>
  )
}
