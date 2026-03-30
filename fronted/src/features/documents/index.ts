// 默认页面导出
export { default } from './page'

// 主要组件导出
export { Documents } from './components/documents'
export { DocumentTable } from './components/document-table'
export { DocumentSearch, SearchHighlight, SearchSuggestions } from './components/document-search'
export { DocumentFilter, QuickFilter } from './components/document-filter'
export { DocumentViewPage } from './components/document-view-page'
export { DocumentHeader } from './components/document-header'
export { DocumentDescription } from './components/document-description'
export { DocumentContent } from './components/document-content'
export { DocumentAttachments } from './components/document-attachments'
export { DocumentActions } from './components/document-actions'

// Hooks导出
export { useDocument } from './hooks/use-document'

// 类型定义导出
export type {
  Document,
  DocumentType,
  DocumentStatus,
  // DocumentAttachment,
  // DocumentVersion,
  // DocumentComment,
  // DocumentPermission,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentListParams,
  DocumentListResponse,
} from './types/document'

// 数据和工具函数导出
export {
  getMockDocuments,
  formatFileSize,
  formatDate,
  mockDocuments,
  mockPaginationData,
  mockFilterOptions,
  mockAuthors,
} from './data/mock-documents'