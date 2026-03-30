// 任务提及相关类型定义

// 任务提及数据接口
export interface TaskMention {
  id: string
  title: string
  status: string
  priority: string
  url: string
  projectId: string
}

export interface UserMention {
  id: number | string
  name: string
  avatar?: string
  email?: string
}

// 提及弹窗配置接口
export interface MentionConfig {
  trigger: string // '@'
  searchDelay: number // 300ms
  maxResults: number // 50
  minSearchLength: number // 0
  showOnFocus?: boolean // 是否在聚焦时显示
}

// 编辑器光标位置接口
export interface CursorPosition {
  start: number
  end: number
  line?: number
  column?: number
}

// 提及插入数据接口
export interface MentionInsert {
  text: string // '[任务标题](任务URL)'
  position: CursorPosition
  taskId: string
  taskTitle: string
}

// 弹窗位置接口
export interface PopupPosition {
  x: number
  y: number
  width?: number
  height?: number
}

// 任务搜索结果接口
export interface TaskSearchResult {
  tasks: TaskMention[]
  loading: boolean
  error: string | null
  hasMore?: boolean
  total?: number
}

// 键盘事件处理接口
export interface KeyboardNavigation {
  selectedIndex: number
  onArrowUp: () => void
  onArrowDown: () => void
  onEnter: () => void
  onEscape: () => void
}

// 默认配置
export const DEFAULT_MENTION_CONFIG: MentionConfig = {
  trigger: '@',
  searchDelay: 300,
  maxResults: 50,
  minSearchLength: 0,
  showOnFocus: false
}

// 任务URL生成函数类型
export type TaskUrlGenerator = (taskId: string, projectId: string) => string

// 默认任务URL生成器
export const generateTaskUrl: TaskUrlGenerator = (taskId: string, projectId: string) => {
  return `/tasks/${taskId}?project=${projectId}`
}