import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DocumentForm } from './document-form'
import type { CreateDocumentInput } from '../types/document'
import { createDocument } from '../services/document-service'
import { NotificationBell } from '@/components/notification-bell'

export function CreateDocumentPage() {
  const navigate = useNavigate()

  const handleSubmit = async (data: CreateDocumentInput) => {
    try {
      // 显示加载状态
      const loadingToast = toast.loading('正在创建文档...')
      
      // 调用文档服务创建文档
      const newDocument = await createDocument(data)
      
      // 关闭加载提示
      toast.dismiss(loadingToast)
      
      // 显示成功消息
      toast.success(`文档「${newDocument.title}」创建成功`)
      
      // 导航到文档列表页面
      navigate({ to: '/documents' })
    } catch (error) {
      // 显示错误消息
      const errorMessage = error instanceof Error ? error.message : '文档创建失败，请重试'
      toast.error(errorMessage)
    }
  }

  const handleCancel = () => {
    navigate({ to: '/documents' })
  }

  return (
    <>
      <Header title="创建文档">
        <div className="ml-auto flex items-center space-x-4">
          <NotificationBell />
        </div>
      </Header>
      <Main>
        <div className="mx-auto max-w-4xl px-4 py-6">
          <div className="space-y-6">
            {/* 页面标题 */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">创建文档</h1>
              <p className="text-sm text-gray-600">
                填写文档信息，支持Markdown格式内容编辑
              </p>
            </div>
            
            {/* 文档表单 */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <DocumentForm
                  mode="create"
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}
