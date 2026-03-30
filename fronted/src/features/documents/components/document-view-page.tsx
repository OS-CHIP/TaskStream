import { useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useNavigate } from '@tanstack/react-router'
import { useDocument } from '../hooks/use-document'
import { DocumentHeader } from './document-header'
import { DocumentContent } from './document-content'
import { DocumentAttachments } from './document-attachments'
import { DocumentActions } from './document-actions'
// 使用简单的加载状态，项目中没有LoadingSpinner组件
import { Alert, AlertDescription } from '@/components/ui/alert'

export function DocumentViewPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { documentId } = useParams({ from: '/_authenticated/documents/$documentId' })
  const { document, loading, error, refetch } = useDocument(documentId)

  const handleEdit = () => {
    navigate({ to: '/documents/edit/$documentId', params: { documentId } })
  }

  const handleBack = () => {
    navigate({ to: '/documents' })
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={refetch} variant="outline">
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>
        </div>
        <Alert>
          <AlertDescription>{t('documents.notFound')}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        <Button
          onClick={handleEdit}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          {t('common.edit')}
        </Button>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl space-y-6 pb-20">
        {/* Document Header */}
        <Card className="bg-gray-50 p-6">
          <DocumentHeader document={document} />
        </Card>


        {/* Document Content */}
        <DocumentContent document={document} />

        {/* Document Actions */}
        <DocumentActions document={document} />

        {/* Attachments */}
        <DocumentAttachments document={document} />
      </div>
    </div>
  )
}
