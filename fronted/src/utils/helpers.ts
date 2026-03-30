import { Instance } from '@/types/instance'
import { Template } from '@/types/templates'

// 验证实例数据
export const validateInstance = (
  template: Template,
  formData: Record<string, unknown>
): string[] => {
  const errors: string[] = []

  template.fields.forEach((field) => {
    if (field.required && (!formData[field.id] || formData[field.id] === '')) {
      errors.push(`${field.name}是必填字段`)
    }
  })

  return errors
}

// 获取字段值
export const getFieldValue = (instance: Instance, fieldId: string): unknown => {
  const field = instance.fields.find((f) => f.fieldId === fieldId)
  return field ? field.value : ''
}

// 格式化字段值显示
export const formatFieldValue = (value: unknown, fieldType: string): string => {
  if (value === null || value === undefined) return '-'

  switch (fieldType) {
    case 'date':
      if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
        const d = new Date(value)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}/${month}/${day}`
      }
      return '-'
    case 'select':
      return Array.isArray(value) ? value.join(', ') : String(value)
    default:
      return String(value)
  }
}
