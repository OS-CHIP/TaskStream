/**
 * 项目切换器内容组件
 * 
 * @description 下拉菜单内容组件，包含搜索输入框和项目列表
 * @author SOLO Document
 * @created 2024-01-20
 */


import { Search, AlertCircle } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { ProjectSwitcherContentProps } from './types'
import { ProjectList, EmptyProjectsState, NoSearchResultsState } from './project-item'
import { useTranslation } from 'react-i18next'

function stripTrailingDate(text: string) {
  if (!text) return ''
  let t = text
  t = t.replace(/\s*[-_ ]?\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?\s*$/u, '')
  t = t.replace(/\s*[-_ ]?\d{8}(?:\d{6})?\s*$/u, '')
  t = t.replace(/\s*[\(\[]\d{4}[-/ ]?\d{2}[-/ ]?\d{2}(?:[ T]\d{2}:\d{2}(?::\d{2})?)?[\)\]]\s*$/u, '')
  return t.trim()
}

/**
 * 项目切换器内容组件
 * 
 * @param props 组件属性
 * @returns JSX元素
 */
export function ProjectSwitcherContent({
  projects,
  currentProject,
  onProjectSelect,
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索项目...',
  emptyMessage,
  noResultsMessage,
  isLoading = false,
  error = null
}: ProjectSwitcherContentProps) {
  const { t } = useTranslation()
  // 处理搜索输入变化
  const handleSearchChange = (value: string) => {
    onSearchChange(value)
  }
  
  // 处理项目选择
  const handleProjectSelect = (project: ProjectSwitcherContentProps['projects'][0]) => {
    onProjectSelect(project)
  }
  
  // 清空搜索
  const handleClearSearch = () => {
    onSearchChange('')
  }
  
  // 如果有错误，显示错误状态
  if (error) {
    return (
      <div className="w-full min-w-[200px] max-w-[300px] p-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm font-medium text-destructive mb-1">加载项目失败</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return <ProjectSwitcherContentSkeleton />
  }

  return (
    <Command className="w-full">
      {/* 搜索输入框 */}
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandInput
          placeholder={searchPlaceholder}
          onValueChange={handleSearchChange}
          className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 truncate"
        />
        {searchValue && (
          <button
            onClick={handleClearSearch}
            className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
            aria-label="清空搜索"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* 项目列表 */}
      <CommandList className="max-h-[300px] overflow-auto">
        {projects.length === 0 ? (
          <CommandEmpty>
            {searchValue ? (
              <NoSearchResultsState searchValue={searchValue} message={noResultsMessage} />
            ) : (
              <EmptyProjectsState message={emptyMessage} />
            )}
          </CommandEmpty>
        ) : (
          <CommandGroup>
            {projects.map((project, index) => (
              <CommandItem
                key={`${project.id}-${index}`}
                value={`${project.id} ${project.name} ${stripTrailingDate(project.description || '')}`}
                onSelect={() => handleProjectSelect(project)}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-sm px-2 py-2.5 text-sm',
                  'aria-selected:bg-accent aria-selected:text-accent-foreground',
                  currentProject?.id === project.id && 'bg-accent text-accent-foreground',
                  project.status === 'archived' && 'opacity-60'
                )}
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
                            {project.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{project.name}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {project.status === 'archived' && (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                        已归档
                      </span>
                    )}
                  </div>
                  
                  {/* 项目描述 */}
                  {project.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate text-xs text-muted-foreground cursor-help">
                            {stripTrailingDate(project.description)}
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
                {currentProject?.id === project.id && (
                  <div className="h-4 w-4 shrink-0">
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      
      {/* 底部信息 */}
      {projects.length > 0 && (
        <div className="border-t px-3 py-2">
          <p className="text-xs text-muted-foreground">
            {searchValue
              ? t('projectSwitcher.searchResults', { count: projects.length })
              : t('projectSwitcher.totalProjects', { count: projects.length })}
          </p>
        </div>
      )}
    </Command>
  )
}

/**
 * 简化版项目切换器内容组件
 * 
 * @description 不使用Command组件的简化版本
 */
export function SimpleProjectSwitcherContent({
  projects,
  currentProject,
  onProjectSelect,
  searchValue,
  onSearchChange,
  searchPlaceholder = '搜索项目...',
  emptyMessage,
  noResultsMessage,
  isLoading = false,
  error = null
}: ProjectSwitcherContentProps) {
  const { t } = useTranslation()
  // 如果有错误，显示错误状态
  if (error) {
    return (
      <div className="w-full min-w-[200px] max-w-[300px] p-4">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-sm font-medium text-destructive mb-1">加载项目失败</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return <ProjectSwitcherContentSkeleton />
  }

  return (
    <div className="w-full min-w-[200px] max-w-[300px] p-1">
      {/* 搜索输入框 */}
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm',
            'placeholder:text-muted-foreground truncate',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          )}
        />
        {searchValue && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="清空搜索"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* 项目列表 */}
      <div className="max-h-[300px] overflow-auto">
        <ProjectList
          projects={projects}
          currentProject={currentProject}
          onProjectSelect={onProjectSelect}
          searchValue={searchValue}
          emptyMessage={emptyMessage}
          noResultsMessage={noResultsMessage}
        />
      </div>
      
      {/* 底部统计 */}
      {projects.length > 0 && (
        <div className="mt-2 border-t pt-2">
          <p className="px-2 text-xs text-muted-foreground">
            {searchValue
              ? t('projectSwitcher.searchResults', { count: projects.length })
              : t('projectSwitcher.totalProjects', { count: projects.length })}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * 项目切换器内容加载状态组件
 */
export function ProjectSwitcherContentSkeleton() {
  return (
    <div className="w-full min-w-[200px] max-w-[300px] p-1">
      {/* 搜索框骨架 */}
      <div className="mb-2 h-9 animate-pulse rounded-md bg-muted" />
      
      {/* 列表骨架 */}
      <div className="space-y-1">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 rounded-sm px-2 py-2.5">
            <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-3 w-32 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
