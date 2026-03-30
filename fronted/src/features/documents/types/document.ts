import { z } from 'zod'

// 文档类型枚举
export const documentTypes = [
  '技术方案',
  '需求文档',
  '设计文档',
  '测试文档',
  '用户手册',
  '项目计划',
  '会议纪要',
  '其他'
] as const

// 文档状态枚举
export const documentStatuses = [
  '草稿',
  '审核中',
  '已发布',
  '已归档'
] as const

// 基础文档schema
export const documentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(documentTypes),
  status: z.enum(documentStatuses),
  author: z.string(),
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  description: z.string().optional(),
  content: z.string().optional(), // Markdown content
  tags: z.array(z.string()).optional(),
  version: z.string().optional(),
  fileSize: z.number().optional(), // in bytes
  downloadUrl: z.string().optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
  })).optional(),
})

// 文档筛选参数schema
export const documentFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.enum([...documentTypes, '全部类型']).optional(),
  status: z.enum([...documentStatuses, '全部状态']).optional(),
  author: z.string().optional(),
  dateRange: z.object({
    start: z.date().optional(),
    end: z.date().optional(),
  }).optional(),
})

// 分页参数schema
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  total: z.number().min(0).default(0),
})

// 文档列表响应schema
export const documentListResponseSchema = z.object({
  documents: z.array(documentSchema),
  pagination: paginationSchema,
  filters: documentFiltersSchema.optional(),
})

// 创建文档schema
export const createDocumentSchema = z.object({
  title: z.string().min(1, '请输入文档标题').max(200, '文档标题不能超过200字符'),
  type: z.enum(documentTypes, { message: '请选择文档类型' }),
  description: z.string().max(1000, '文档描述不能超过1000字符').optional(),
  content: z.string().min(1, '请输入文档内容'),
  tags: z.array(z.string()).optional(),
  attachments: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        name: z.string(),
        url: z.string().optional(),
        size: z.number(),
        type: z.string(),
        status: z.enum(['pending', 'uploading', 'success', 'error']).optional(),
        progress: z.number().optional(),
        uploadedAt: z.date().optional(),
        linkedToTask: z.boolean().optional(),
        error: z.string().optional(),
      })
    )
    .optional(),
})

// 更新文档schema
export const updateDocumentSchema = createDocumentSchema.partial()

// API request/response types
export type CreateDocumentRequest = z.infer<typeof createDocumentSchema>
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>
export type UpdateDocumentRequest = z.infer<typeof updateDocumentSchema>

export interface DocumentListParams {
  page?: number
  pageSize?: number
  search?: string
  types?: DocumentType[]
  statuses?: DocumentStatus[]
  authors?: string[]
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// TypeScript类型导出
export type Document = z.infer<typeof documentSchema>
export type DocumentType = typeof documentTypes[number]

// 为了向后兼容，创建DocumentType枚举对象
export const DocumentType = {
  TECHNICAL: '技术方案' as const,
  REQUIREMENT: '需求文档' as const,
  DESIGN: '设计文档' as const,
  TEST: '测试文档' as const,
  GUIDE: '用户手册' as const,
  PROJECT: '项目计划' as const,
  MEETING: '会议纪要' as const,
  OTHER: '其他' as const,
} as const
export type DocumentStatus = typeof documentStatuses[number]
export type DocumentFilters = z.infer<typeof documentFiltersSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type DocumentListResponse = z.infer<typeof documentListResponseSchema>
export type CreateDocumentFormData = z.infer<typeof createDocumentSchema>
export type UpdateDocumentFormData = z.infer<typeof updateDocumentSchema>

// 文档操作类型
export type DocumentAction = 'view' | 'edit' | 'delete' | 'download' | 'share'

// 文档表格列配置
export interface DocumentTableColumn {
  key: keyof Document | 'actions'
  title: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
}

// 文档搜索配置
export interface DocumentSearchConfig {
  placeholder: string
  debounceMs: number
  minLength: number
}

// 文档筛选选项
export interface DocumentFilterOption {
  label: string
  value: string
}

// 文档分页配置
export interface DocumentPaginationConfig {
  pageSizeOptions: number[]
  showSizeChanger: boolean
  showQuickJumper: boolean
  showTotal: boolean
}
