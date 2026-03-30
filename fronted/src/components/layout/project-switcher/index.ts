/**
 * 项目切换器模块入口文件
 * 
 * @description 统一导出项目切换器相关的所有组件、Hook和类型
 * @author SOLO Document
 * @created 2024-01-20
 */

// 主要组件
export {
  ProjectSwitcher,
  SimpleProjectSwitcher,
  CompactProjectSwitcher,
  ResponsiveProjectSwitcher,
  SafeProjectSwitcher,
  default
} from './project-switcher'

// 触发器组件
export {
  ProjectSwitcherTrigger,
  CompactProjectSwitcherTrigger,
  IconProjectSwitcherTrigger,
  ResponsiveProjectSwitcherTrigger,
  ProjectSwitcherTriggerSkeleton
} from './project-switcher-trigger'

// 内容组件
export {
  ProjectSwitcherContent,
  SimpleProjectSwitcherContent,
  ProjectSwitcherContentSkeleton
} from './project-switcher-content'

// 项目项组件
export {
  ProjectItem,
  ProjectItemSkeleton,
  EmptyProjectsState,
  NoSearchResultsState,
  ProjectList
} from './project-item'

// Hook
export {
  useProjectSwitcher,
  useProjectSearch,
  useProjectState
} from './use-project-switcher'

export {
  useProjectsQuery
} from './use-projects-query'

export {
  useProjectOperations,
  useProjectCache
} from './use-project-operations'

// 数据和工具函数
export {
  MOCK_PROJECTS,
  getAllProjects,
  getActiveProjects,
  getArchivedProjects,
  getProjectById,
  getDefaultProject,
  searchProjects
} from '../data/projects-data'

// 类型定义
export type {
  Project,
  ProjectStatus,
  ProjectSwitcherProps,
  ProjectSwitcherTriggerProps,
  ProjectSwitcherContentProps,
  ProjectItemProps,
  UseProjectSwitcherReturn,
  UseProjectSwitcherOptions,
  ProjectSwitcherVariant,
  ProjectSwitcherSize,
  ProjectSwitcherStyleConfig,
  ProjectFilterFunction,
  ProjectSwitcherState,
  ProjectSwitcherAction
} from './types'

// 常量
export const PROJECT_SWITCHER_CONSTANTS = {
  SEARCH_DEBOUNCE_DELAY: 300,
  MAX_VISIBLE_PROJECTS: 50,
  ANIMATION_DURATION: 200,
  KEYBOARD_NAVIGATION_DELAY: 100
} as const

// 默认配置
export const DEFAULT_PROJECT_SWITCHER_CONFIG = {
  searchPlaceholder: '搜索项目...',
  emptyMessage: '暂无项目',
  noResultsMessage: '未找到匹配的项目',
  variant: 'default' as const,
  size: 'default' as const,
  disabled: false
} as const