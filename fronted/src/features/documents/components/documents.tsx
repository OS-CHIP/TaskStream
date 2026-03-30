import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from 'react-i18next'
import { useNavigate } from '@tanstack/react-router'
import { DocumentTable } from './document-table'
import { DocumentSearch } from './document-search'
import { DocumentFilter } from './document-filter'
import { mockFilterOptions } from '../data/mock-documents'
import { queryDocumentPage, transformDocumentRecords, deleteDocument } from '../services/document-service'
import { showSuccess, showError } from '@/utils/error-handler'
import { ConfirmDialog } from '@/components/confirm-dialog'
import type { Document, DocumentType, DocumentStatus } from '../types/document'
import { X } from 'lucide-react'

interface DocumentsState {
  documents: Document[]
  searchTerm: string
  selectedTypes: DocumentType[]
  selectedStatuses: DocumentStatus[]
  currentPage: number
  pageSize: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  total: number
}

export function Documents() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [state, setState] = React.useState<DocumentsState>({
    documents: [],
    searchTerm: '',
    selectedTypes: [],
    selectedStatuses: [],
    currentPage: 1,
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    total: 0,
  })

  const [isLoading, setIsLoading] = React.useState(false)

  // 加载文档数据
  const loadDocuments = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const statusMap: Record<string, string> = {
        '草稿': 'draft',
        '审核中': 'review',
        '已发布': 'published',
        '已归档': 'archived',
      }
      const statusForApi = state.selectedStatuses.length > 0 ? statusMap[state.selectedStatuses[0]] : undefined
      const resp = await queryDocumentPage({
        pageNum: String(state.currentPage),
        pageSize: String(state.pageSize),
        keyword: state.searchTerm || undefined,
        status: statusForApi,
      })
      const documents = transformDocumentRecords(resp.records)
      setState(prev => ({ ...prev, documents, total: resp.total }))
    } catch (_error) {
        // Handle error silently or show user notification
      } finally {
      setIsLoading(false)
    }
  }, [
    state.searchTerm,
    state.selectedTypes,
    state.selectedStatuses,
    state.currentPage,
    state.pageSize,
  ])

  // 初始加载
  React.useEffect(() => {
    loadDocuments()
  }, [loadDocuments])

  // 搜索处理
  const handleSearch = (searchTerm: string) => {
    setState(prev => ({ 
      ...prev, 
      searchTerm, 
      currentPage: 1 // 重置到第一页
    }))
  }

  // 筛选处理
  const handleTypeChange = (types: DocumentType[]) => {
    setState(prev => ({ 
      ...prev, 
      selectedTypes: types, 
      currentPage: 1 
    }))
  }

  const handleStatusChange = (statuses: DocumentStatus[]) => {
    setState(prev => ({ 
      ...prev, 
      selectedStatuses: statuses, 
      currentPage: 1 
    }))
  }

  const handleClearAllFilters = () => {
    setState(prev => ({
      ...prev,
      selectedTypes: [],
      selectedStatuses: [],
      searchTerm: '',
      currentPage: 1,
    }))
  }

  // 已移除输入框下的固定标签（快速筛选）

  // 分页处理
  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, currentPage: 1 }))
  }

  // 排序处理
  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setState(prev => ({ ...prev, sortBy, sortOrder }))
  }

  // 文档操作
  const handleDocumentAction = (action: string, documentId: string) => {
    switch (action) {
      case 'edit':
        navigate({ to: '/documents/edit/$documentId', params: { documentId } })
        break
      case 'view':
        // TODO: Implement view action
        break
      case 'delete':
        // handled by onDelete below
        break
      case 'download':
        // TODO: Implement download action
        break
      default:
        break
    }
  }

  // 编辑文档
  const handleEditDocument = (document: Document) => {
    navigate({ to: '/documents/edit/$documentId', params: { documentId: document.id } })
  }
  const handleViewDocument = (document: Document) => {
    navigate({ to: '/documents/$documentId', params: { documentId: document.id } })
  }

  const [deleteState, setDeleteState] = React.useState<{ open: boolean; target?: Document; loading?: boolean }>({ open: false })
  const handleDeleteDocument = async (document: Document) => {
    setDeleteState({ open: true, target: document, loading: false })
  }
  const confirmDelete = async () => {
    if (!deleteState.target) return
    try {
      setDeleteState(prev => ({ ...prev, loading: true }))
      await deleteDocument(deleteState.target.id)
      showSuccess('删除成功')
      setDeleteState({ open: false, target: undefined, loading: false })
      await loadDocuments()
    } catch (error) {
      setDeleteState(prev => ({ ...prev, loading: false }))
      showError(error)
    }
  }

  // 统计信息
  const totalDocuments = state.total
  // const hasActiveFilters = state.selectedTypes.length > 0 || 
  //                         state.selectedStatuses.length > 0 || 
  //                         state.selectedAuthors.length > 0 ||
  //                         state.searchTerm.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* 页面头部 */}
      <div className="mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('documents.title')}</h2>
          <p className="text-muted-foreground">
            {t('documents.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="sm"
            onClick={() => navigate({ to: '/documents/create' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('documents.actions.create')}
          </Button>
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="space-y-4 mb-6">
        {/* 搜索框 */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <DocumentSearch
              value={state.searchTerm}
              onChange={handleSearch}
              placeholder={t('documents.search.placeholder')}
            />
          </div>
          <DocumentFilter
            selectedTypes={state.selectedTypes}
            selectedStatuses={state.selectedStatuses}
            typeOptions={mockFilterOptions.types.filter(opt => opt.value !== '全部类型')}
            statusOptions={mockFilterOptions.statuses}
            onTypeChange={handleTypeChange}
            onStatusChange={handleStatusChange}
            onClearAll={handleClearAllFilters}
            showBadges={false}
          />
        </div>
        
        <div className="flex items-center gap-1 flex-wrap mt-2">
          {state.selectedTypes.map((type) => {
            const option = mockFilterOptions.types.find(opt => opt.value === type)
            return (
              <Badge key={type} variant="secondary" className="text-xs h-6 pr-1">
                {option?.label || type}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleTypeChange(state.selectedTypes.filter(t => t !== type))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          {state.selectedStatuses.map((status) => {
            const option = mockFilterOptions.statuses.find(opt => opt.value === status)
            return (
              <Badge key={status} variant="secondary" className="text-xs h-6 pr-1">
                {option?.label || status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => handleStatusChange(state.selectedStatuses.filter(s => s !== status))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>
      </div>

      {/* 文档表格 - 使用flex-1确保占据剩余空间 */}
      <div className="flex-1 overflow-hidden">
        <DocumentTable
          data={state.documents}
          loading={isLoading}
          onAction={handleDocumentAction}
          onView={handleViewDocument}
          onEdit={handleEditDocument}
          onDelete={handleDeleteDocument}
          onSort={handleSort}
          sortBy={state.sortBy}
          sortOrder={state.sortOrder}
          pagination={{
            page: state.currentPage,
            pageSize: state.pageSize,
            total: totalDocuments,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
        <ConfirmDialog
          open={deleteState.open}
          onOpenChange={(open) => setDeleteState(prev => ({ ...prev, open }))}
          title={t('documents.actions.delete')}
          desc={`确认删除文档「${deleteState.target?.title ?? ''}」吗？`}
          cancelBtnText={t('common.cancel')}
          confirmText={t('documents.actions.delete')}
          destructive
          isLoading={!!deleteState.loading}
          handleConfirm={confirmDelete}
        />
      </div>
    </div>
  )
}
