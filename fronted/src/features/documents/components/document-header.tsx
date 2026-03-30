import { useTranslation } from 'react-i18next'
import { Calendar, User, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Document } from '../types/document'
import { formatDate } from '../data/mock-documents'

interface DocumentHeaderProps {
  document: Document
}

export function DocumentHeader({ document }: DocumentHeaderProps) {
  const { t } = useTranslation()

  const getTypeColor = (type: Document['type']) => {
    switch (type) {
      case '技术方案':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case '用户手册':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case '设计文档':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case '需求文档':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case '测试文档':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case '项目计划':
        return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'
      case '会议纪要':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-200'
      case '其他':
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case '草稿':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case '审核中':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case '已发布':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case '已归档':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  return (
    <div className="space-y-4">
      {/* Document Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
          {document.title}
        </h1>
        {document.description && (
          <p className="text-sm text-gray-600">
            {document.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getTypeColor(document.type)}>
            <FileText className="mr-1 h-3 w-3" />
            {document.type}
          </Badge>
          <Badge className={getStatusColor(document.status)}>
            {document.status}
          </Badge>
        </div>
      </div>

      {/* Document Meta Information */}
      <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-3">
        {/* Author */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{t('documents.author')}:</span>
          <span>{document.author}</span>
        </div>

        {/* Created Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{t('documents.createdAt')}:</span>
          <span>{formatDate(document.createdAt)}</span>
        </div>

        {/* Updated Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{t('documents.updatedAt')}:</span>
          <span>{document.updatedAt ? formatDate(document.updatedAt) : '未知时间'}</span>
        </div>
      </div>
    </div>
  )
}
