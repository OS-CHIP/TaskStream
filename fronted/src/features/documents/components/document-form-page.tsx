import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DocumentForm } from './document-form'
import { CreateDocumentFormData } from '../types/document'
import { NotificationBell } from '@/components/notification-bell'
 

interface DocumentFormPageProps {
  mode: 'create' | 'edit'
}

export function DocumentFormPage({ mode }: DocumentFormPageProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  
  // 始终调用useParams，但只在编辑模式下使用参数
  const editParams = useParams({ strict: false })
  const documentId = mode === 'edit' ? editParams.documentId : undefined
  
  const [initialData, setInitialData] = useState<CreateDocumentFormData | undefined>()
  const [isLoading, setIsLoading] = useState(mode === 'edit')

  // 编辑模式下加载文档数据
  useEffect(() => {
    if (mode === 'edit') {
      if (documentId) {
        setIsLoading(true)
        ;(async () => {
          try {
            const { getDocumentDetail } = await import('../services/document-service')
            const doc = await getDocumentDetail(documentId)
            const attachments = Array.isArray(doc.attachments)
              ? doc.attachments.map((a: any) => ({ ...a, status: 'success' }))
              : []
            setInitialData({
              title: doc.title,
              type: doc.type,
              description: doc.description || '',
              content: doc.content || '',
              attachments,
            })
          } catch (_error) {
            toast.error((_error instanceof Error && _error.message) || t('documents.detail.failed'))
          } finally {
            setIsLoading(false)
          }
        })()
      } else {
        setIsLoading(false)
      }
    }
  }, [mode, documentId, t])

  const handleSubmit = async (_data: CreateDocumentFormData) => {
    try {
      const loading = toast.loading(t('common.loading'))
      if (mode === 'edit' && documentId) {
        const { updateDocument } = await import('../services/document-service')
        await updateDocument(documentId, _data)
      } else {
        const { saveDocument } = await import('../services/document-service')
        await saveDocument(_data)
      }
      toast.dismiss(loading)
      toast.success(t('common.success', { defaultValue: '操作成功' }))
      navigate({ to: '/documents' })
    } catch (_error) {
      toast.error((_error instanceof Error && _error.message) || t('common.error.unknown', { defaultValue: '操作失败' }))
    }
  }

  const handleCancel = () => {
    navigate({ to: '/documents' })
  }

  if (mode === 'edit' && isLoading) {
    return (
      <>
        <Header>
          <div className="ml-auto flex items-center space-x-4">
            <NotificationBell />
          </div>
        </Header>
        <Main>
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">{t('common.loading')}</div>
          </div>
        </Main>
      </>
    )
  }

  return (
    <>
      <Header>
        <div className="ml-auto flex items-center space-x-4">
          <NotificationBell />
        </div>
      </Header>
      <Main>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === 'create' ? t('documents.create.title') : t('documents.edit.title')}
            </h1>
            <p className="text-muted-foreground">
              {mode === 'create' 
                ? t('documents.create.description') 
                : t('documents.edit.description')
              }
            </p>
          </div>
          
          <DocumentForm
            mode={mode}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </Main>
    </>
  )
}
