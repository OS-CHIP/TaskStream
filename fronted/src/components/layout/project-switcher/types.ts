/**
 * 项目切换器相关的TypeScript类型定义
 * 
 * @description 定义项目切换器组件所需的所有接口和类型
 * @author SOLO Document
 * @created 2024-01-20
 */

/**
 * 项目状态类型
 */
export type ProjectStatus = '1' | '2' | 'active' | 'archived'

/**
 * 项目切换器变体类型
 */
export type ProjectSwitcherVariant = 'default' | 'responsive' | 'compact'

/**
 * 项目切换器尺寸类型
 */
export type ProjectSwitcherSize = 'default' | 'sm' | 'lg'

/**
 * 项目切换器样式配置类型
 */
export type ProjectSwitcherStyleConfig = ProjectSwitcherStyles

/**
 * 项目数据结构
 */
export interface Project {
  /** 项目唯一标识符 */
  id: string
  /** 项目名称 */
  name: string
  /** 项目描述（可选） */
  description?: string
  /** 项目头像/图标URL（可选） */
  avatar?: string
  /** 项目状态 */
  status: ProjectStatus
  /** 创建时间 */
  createdAt?: Date | string
  /** 更新时间（可选） */
  updatedAt?: Date | string
  /** 项目键值 */
  key?: string
  /** 可见性 */
  visibility?: string
}

/**
 * 项目切换器主组件Props
 */
export interface ProjectSwitcherProps {
  /** 项目列表 */
  projects?: Project[]
  /** 自定义CSS类名 */
  className?: string
  /** 默认选中的项目ID */
  defaultProjectId?: string
  /** 项目切换回调函数 */
  onProjectChange?: (project: Project) => void
  /** 是否禁用组件 */
  disabled?: boolean
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 空状态消息 */
  emptyMessage?: string
  /** 无搜索结果消息 */
  noResultsMessage?: string
  /** 组件变体 */
  variant?: 'default' | 'responsive' | 'compact'
  /** 组件大小 */
  size?: 'default' | 'sm' | 'lg'
  /** 触发器自定义类名 */
  triggerClassName?: string
  /** 内容区自定义类名 */
  contentClassName?: string
}

/**
 * 项目切换器触发器组件Props
 */
export interface ProjectSwitcherTriggerProps {
  /** 当前选中的项目 */
  currentProject: Project | null
  /** 下拉菜单是否打开 */
  isOpen: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义CSS类名 */
  className?: string
}

/**
 * 项目切换器内容组件Props
 */
export interface ProjectSwitcherContentProps {
  /** 项目列表 */
  projects: Project[]
  /** 当前选中的项目 */
  currentProject: Project | null
  /** 项目选择回调 */
  onProjectSelect: (project: Project) => void
  /** 搜索关键词 */
  searchValue: string
  /** 搜索关键词变更回调 */
  onSearchChange: (value: string) => void
  /** 搜索框占位符 */
  searchPlaceholder?: string
  /** 空状态消息 */
  emptyMessage?: string
  /** 无搜索结果消息 */
  noResultsMessage?: string
  /** 是否加载中 */
  isLoading?: boolean
  /** 错误信息 */
  error?: string | null
  /** 搜索输入框引用 */
  searchInputRef?: React.RefObject<HTMLInputElement> | null
}

/**
 * 项目选项组件Props
 */
export interface ProjectItemProps {
  /** 项目数据 */
  project: Project
  /** 是否为选中状态 */
  isSelected: boolean
  /** 选择回调函数 */
  onSelect: (project: Project) => void
  /** 搜索关键词（用于高亮显示） */
  searchValue?: string
}

/**
 * 项目切换器Hook返回值类型
 */
export interface UseProjectSwitcherReturn {
  /** 当前选中的项目 */
  currentProject: Project | null
  /** 所有项目列表 */
  projects: Project[]
  /** 过滤后的项目列表 */
  filteredProjects: Project[]
  /** 搜索值 */
  searchValue: string
  /** 下拉菜单是否打开 */
  isOpen: boolean
  /** 是否正在加载 */
  isLoading: boolean
  /** 错误信息 */
  error: string | null
  /** 倒计时对话框是否显示 */
  showCountdownDialog: boolean
  /** 设置当前项目 */
  setCurrentProject: (project: Project) => void
  /** 设置搜索值 */
  setSearchValue: (value: string) => void
  /** 设置下拉菜单开关状态 */
  setIsOpen: (open: boolean) => void
  /** 处理项目选择 */
  handleProjectSelect: (project: Project) => void
  /** 清除选中项目缓存 */
  clearSelectedProjectCache: () => void
  /** 设置倒计时对话框显示状态 */
  setShowCountdownDialog: (show: boolean) => void
}

/**
 * useProjectSwitcher Hook参数类型
 */
export interface UseProjectSwitcherOptions {
  /** 外部传入的项目列表（可选，如果不传则从API获取） */
  projects?: Project[]
  /** 默认选中的项目ID */
  defaultProjectId?: string
  /** 项目切换回调函数 */
  onProjectChange?: (project: Project) => void
}

/**
 * 项目切换器样式配置类型
 */
export interface ProjectSwitcherStyles {
  /** 容器样式 */
  container: string
  /** 触发器样式配置 */
  trigger: {
    base: string
    hover: string
    focus: string
    disabled: string
  }
  /** 内容区域样式配置 */
  content: {
    base: string
    maxHeight: string
  }
  /** 搜索输入框样式配置 */
  searchInput: {
    base: string
    placeholder: string
    focus: string
  }
  /** 项目选项样式配置 */
  projectItem: {
    base: string
    hover: string
    selected: string
  }
}

/**
 * 项目搜索过滤函数类型
 */
export type ProjectFilterFunction = (projects: Project[], searchValue: string) => Project[]

/**
 * 项目切换器状态类型
 */
export type ProjectSwitcherState = {
  currentProject: Project | null
  searchValue: string
  isOpen: boolean
}

/**
 * 项目切换器动作类型
 */
export type ProjectSwitcherAction = 
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'SET_SEARCH_VALUE'; payload: string }
  | { type: 'SET_IS_OPEN'; payload: boolean }
  | { type: 'RESET' }
