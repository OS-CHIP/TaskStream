import { useState } from 'react'
import { Instance, InstanceFormData } from '@/types/instance'
import { Template } from '@/types/templates'
import { WorkflowStatus } from '@/types/workflow'

export const useInstanceCreator = (template: Template) => {
  const [fieldValues, setFieldValues] = useState<Record<string, unknown>>({})
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): string[] => {
    const errors: string[] = []

    template.fields.forEach((field) => {
      if (
        field.required &&
        (!fieldValues[field.id] || fieldValues[field.id] === '')
      ) {
        errors.push(`${field.name}是必填字段`)
      }
    })

    return errors
  }

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }))
    // 清除该字段的错误
    if (errors.length > 0) {
      setErrors((prev) =>
        prev.filter(
          (error) =>
            !error.includes(
              template.fields.find((f) => f.id === fieldId)?.name || ''
            )
        )
      )
    }
  }

  const handleSubmit = async (): Promise<Instance | null> => {
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return null
    }

    setIsSubmitting(true)

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const newInstance: Instance = {
        id: `instance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        templateId: template.id,
        type: template.type,
        fields: Object.entries(fieldValues).map(([fieldId, value]) => ({
          fieldId,
          value,
        })),
        status: WorkflowStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'current-user',
      }

      return newInstance
    } catch (_error) {
      setErrors(['创建失败，请重试'])
      return null
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = (): InstanceFormData => {
    return {
      templateId: template.id,
      fieldValues,
    }
  }

  const resetForm = () => {
    setFieldValues({})
    setErrors([])
  }

  return {
    fieldValues,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    handleSaveDraft,
    resetForm,
  }
}
