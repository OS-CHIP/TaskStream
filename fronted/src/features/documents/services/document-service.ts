import { type CreateDocumentInput, type Document, type DocumentListParams } from '../types/document'
import { apiClient } from '@/lib/api-client'

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 生成唯一ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// 模拟文档存储
let documentsStore: Document[] = []

/**
 * 创建文档
 */
export async function createDocument(data: CreateDocumentInput): Promise<Document> {
  await delay(1000) // 模拟网络延迟
  
  // 验证数据
  if (!data.title?.trim()) {
    throw new Error('文档标题不能为空')
  }
  
  if (!data.content?.trim()) {
    throw new Error('文档内容不能为空')
  }
  
  // 创建新文档
  const newDocument: Document = {
    id: generateId(),
    title: data.title.trim(),
    type: data.type,
    status: '草稿', // 新创建的文档默认为草稿状态
    author: '当前用户', // TODO: 从用户上下文获取
    createdAt: new Date(),
    updatedAt: new Date(),
    description: data.description?.trim(),
    content: data.content.trim(),
    tags: data.tags || [],
    version: 'v1.0',
    fileSize: new Blob([data.content]).size,
  }
  
  // 处理附件
  if (data.attachments && data.attachments.length > 0) {
    // TODO: 实际的文件上传处理
  }
  
  // 保存到存储
  documentsStore.push(newDocument)
  
  return newDocument
}

export async function saveDocument(data: CreateDocumentInput): Promise<void> {
  const projectId = typeof window !== 'undefined' ? localStorage.getItem('selected_project_id') : null
  if (!projectId) {
    throw new Error('请先选择项目')
  }
  const attachmentIds = (data.attachments || [])
    .map((a: any) => a?.id)
    .filter((id: any) => id !== undefined && id !== null)
    .map((id: any) => Number(id))
    .filter((id: number) => !Number.isNaN(id))
  const payload = {
    projectId,
    title: data.title,
    description: data.description ?? '',
    documentType: data.type,
    content: data.content,
    status: 'draft',
    attachmentIds: attachmentIds.length > 0 ? attachmentIds : []
  }
  await apiClient.post('/document/saveDocument', payload)
}

export interface QueryDocumentPageResponseRecord {
  id: number
  projectId: number
  title: string
  description?: string
  documentType?: string
  content?: string
  status?: string
  createBy?: number
  createTime?: string
  updateTime?: string
  isDeleted?: number
}

export interface QueryDocumentPageResponse {
  records: QueryDocumentPageResponseRecord[]
  total: number
  size: number
  current: number
  orders: string[]
  optimizeCountSql: boolean
  hitCount: boolean
  countId: null
  maxLimit: null
  searchCount: boolean
  pages: number
}

function mapApiStatusToDocumentStatus(status?: string): Document['status'] {
  const s = String(status || '').toLowerCase()
  if (s === 'published' || s === 'release') return '已发布'
  if (s === 'draft') return '草稿'
  if (s === 'review' || s === 'pending' || s === 'in_review') return '审核中'
  if (s === 'archived') return '已归档'
  return '草稿'
}

function toDate(value?: string): Date {
  if (!value) return new Date()
  const v = value.replace(' ', 'T')
  const d = new Date(v)
  return isNaN(d.getTime()) ? new Date() : d
}

export async function queryDocumentPage(params: {
  pageNum?: string
  pageSize?: string
  projectId?: string
  keyword?: string
  status?: string
}): Promise<QueryDocumentPageResponse> {
  const effectiveProjectId = params.projectId || (typeof window !== 'undefined' ? localStorage.getItem('selected_project_id') || '' : '')
  const requestParams: Record<string, string> = {
    pageNum: params.pageNum || '1',
    pageSize: params.pageSize || '10',
    projectId: effectiveProjectId,
    keyword: params.keyword ?? '',
  }
  if (params.status) requestParams.status = params.status
  const response = await apiClient.postFormData<QueryDocumentPageResponse>('/document/queryDocumentPage', requestParams)
  if (response.code !== 200) {
    throw new Error(response.msg || '查询文档列表失败')
  }
  return response.data
}

export function transformDocumentRecords(records: QueryDocumentPageResponseRecord[]): Document[] {
  return (records || []).map((rec) => ({
    id: String(rec.id),
    title: rec.title || '',
    type: (rec.documentType as any) || '其他',
    status: mapApiStatusToDocumentStatus(rec.status),
    author: String(rec.createBy || ''),
    createdAt: toDate(rec.createTime),
    updatedAt: rec.updateTime ? toDate(rec.updateTime) : undefined,
    description: rec.description || '',
    content: rec.content || '',
    tags: [],
    version: 'v1.0',
    fileSize: undefined,
    downloadUrl: undefined,
    attachments: [],
  }))
}

export async function getDocumentDetail(id: string): Promise<Document> {
  const response = await apiClient.get<{ id: number; projectId: number; title: string; description?: string; documentType?: string; content?: string; status?: string; createBy?: number; createTime?: string; updateTime?: string; attachment?: Array<{ id: number; url: string; fileName: string; fileSize: number; mimeType: string }> }>(`/document/getDocument/${id}`)
  if (response.code !== 200) {
    throw new Error(response.msg || '获取文档详情失败')
  }
  const data = (response.data as any).data || response.data
  const attachments = Array.isArray(data?.attachment)
    ? data.attachment.map((att: any) => ({
        id: String(att.id),
        name: String(att.fileName || ''),
        url: String(att.url || ''),
        size: Number(att.fileSize || 0),
        type: String(att.mimeType || ''),
      }))
    : []
  return {
    id: String(data.id),
    title: String(data.title || ''),
    type: (data.documentType as any) || '其他',
    status: mapApiStatusToDocumentStatus(data.status),
    author: String(data.createBy || ''),
    createdAt: toDate(data.createTime),
    updatedAt: data.updateTime ? toDate(data.updateTime) : undefined,
    description: data.description || '',
    content: data.content || '',
    tags: [],
    version: 'v1.0',
    attachments,
  }
}

/**
 * 更新文档（调用后端接口）
 */
export async function updateDocument(id: string, data: CreateDocumentInput): Promise<void> {
  const attachmentIds = (data.attachments || [])
    .map((a: any) => a?.id)
    .filter((id: any) => id !== undefined && id !== null)
    .map((id: any) => Number(id))
    .filter((id: number) => !Number.isNaN(id))

  const payload = {
    id: String(id),
    title: data.title,
    description: data.description ?? '',
    documentType: data.type,
    content: data.content,
    status: 'draft',
    attachmentIds: attachmentIds.length > 0 ? attachmentIds : []
  }

  const response = await apiClient.post<null>('/document/updateDocument', payload)
  if (response.code !== 200 && response.code !== 0) {
    throw new Error(response.msg || '更新文档失败')
  }
}

/**
 * 获取文档详情
 */
export async function getDocument(id: string): Promise<Document | null> {
  await delay(500)
  
  const document = documentsStore.find(doc => doc.id === id)
  return document || null
}

/**
 * 获取文档列表
 */
export async function getDocuments(params: DocumentListParams = {}): Promise<{
  documents: Document[]
  total: number
  page: number
  pageSize: number
}> {
  await delay(600)
  
  let filteredDocuments = [...documentsStore]
  
  // 搜索过滤
  if (params.search) {
    const searchTerm = params.search.toLowerCase()
    filteredDocuments = filteredDocuments.filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.description?.toLowerCase().includes(searchTerm) ||
      doc.content?.toLowerCase().includes(searchTerm)
    )
  }
  
  // 类型过滤
  if (params.types && params.types.length > 0) {
    filteredDocuments = filteredDocuments.filter(doc => 
      params.types!.includes(doc.type)
    )
  }
  
  // 状态过滤
  if (params.statuses && params.statuses.length > 0) {
    filteredDocuments = filteredDocuments.filter(doc => 
      params.statuses!.includes(doc.status)
    )
  }
  
  // 作者过滤
  if (params.authors && params.authors.length > 0) {
    filteredDocuments = filteredDocuments.filter(doc => 
      params.authors!.includes(doc.author)
    )
  }
  
  // 排序
  if (params.sortBy) {
    filteredDocuments.sort((a, b) => {
      const aValue = a[params.sortBy as keyof Document]
      const bValue = b[params.sortBy as keyof Document]
      
      if (aValue != null && bValue != null) {
        if (aValue < bValue) return params.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return params.sortOrder === 'asc' ? 1 : -1
      }
      return 0
    })
  }
  
  // 分页
  const page = params.page || 1
  const pageSize = params.pageSize || 10
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex)
  
  return {
    documents: paginatedDocuments,
    total: filteredDocuments.length,
    page,
    pageSize,
  }
}

/**
 * 删除文档
 */
export async function deleteDocument(id: string): Promise<void> {
  const response = await apiClient.get<null>(`/document/deleteDocument/${id}`)
  if (response.code !== 200 && response.code !== 0) {
    throw new Error(response.msg || '删除文档失败')
  }
}

/**
 * 批量删除文档
 */
export async function deleteDocuments(ids: string[]): Promise<void> {
  await delay(800)
  
  documentsStore = documentsStore.filter(doc => !ids.includes(doc.id))
}

/**
 * 下载文档
 */
export async function downloadDocument(id: string): Promise<Blob> {
  await delay(300)
  
  const document = documentsStore.find(doc => doc.id === id)
  if (!document) {
    throw new Error('文档不存在')
  }
  
  // 创建文档内容的Blob
  const content = `# ${document.title}\n\n${document.description || ''}\n\n${document.content || ''}`
  return new Blob([content], { type: 'text/markdown' })
}

/**
 * 初始化文档存储（用于开发测试）
 */
export function initializeDocumentsStore(documents: Document[]) {
  documentsStore = [...documents]
}

/**
 * 获取文档存储（用于调试）
 */
export function getDocumentsStore() {
  return [...documentsStore]
}
