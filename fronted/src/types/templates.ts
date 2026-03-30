export interface TemplateField {
  id: string
  remoteId?: number
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'markdown'
  required: boolean
  options?: { label: string; value: string }[]
  multiple?: boolean
  accept?: string
  maxSize?: number
  // Markdown 编辑器特定配置
  markdownConfig?: {
    height?: number
    preview?: 'edit' | 'preview' | 'live'
    visibleDragbar?: boolean
  }
}

export type TemplateType = 'requirement' | 'task' | 'bug' | 'test'
export const TemplateTypes = ['requirement', 'task', 'bug', 'test']

export interface Template {
  id: string
  name: string
  type: TemplateType
  description: string
  fields: TemplateField[]
  createdAt: Date
  updatedAt: Date
}

export interface FieldValue {
  fieldId: string
  value: unknown
}

export interface FileInfo {
  id: string
  name: string
  size: number
  type: string
  url: string
  previewUrl?: string
  uploadedAt: Date
}


// 字段类型选项
export const fieldTypes = [
  { value: 'text', label: '文本' },
  { value: 'number', label: '数字' },
  { value: 'date', label: '日期' },
  { value: 'select', label: '下拉选择' },
  { value: 'textarea', label: '多行文本' },
  { value: 'markdown', label: 'Markdown编辑器' },
] as const
