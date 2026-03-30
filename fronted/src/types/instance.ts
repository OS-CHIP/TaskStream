import { TemplateType, FieldValue, FileInfo, Template } from '@/types/templates'
import { WorkflowStatusId } from '@/types/workflow'

export interface Instance {
  id: string
  templateId: string
  type: TemplateType
  fields: FieldValue[]
  status: WorkflowStatusId
  createdAt: Date
  updatedAt: Date
  createdBy: string
  attachments?: FileInfo[] // 存储所有上传的文件
}

export interface InstanceFormData {
  templateId: string
  fieldValues: Record<string, unknown>
}

// 实例创建器的props
export interface InstanceCreatorProps {
  template: Template
  onSuccess?: (instance: Instance) => void
  onCancel?: () => void
  onSaveDraft?: (formData: InstanceFormData) => void
  mode?: 'page' | 'embedded' // 页面模式或嵌入模式
  className?: string
}
