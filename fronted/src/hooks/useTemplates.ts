import { useState } from 'react'
import { initialTemplates } from '@/data/initialTemplates'
import { Template, TemplateField } from '@/types/templates'

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)

  const addTemplate = (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTemplates([...templates, newTemplate])
  }

  // 支持自定义ID的模板创建（用于与任务类型ID进行映射）
  const addTemplateWithId = (
    template: Omit<Template, 'createdAt' | 'updatedAt'>
  ) => {
    const newTemplate: Template = {
      ...template,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTemplates([...templates, newTemplate])
  }

  const updateTemplate = (
    id: string,
    updatedTemplate: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>
  ) => {
    setTemplates(
      templates.map((template) =>
        template.id === id
          ? {
              ...template,
              ...updatedTemplate,
              updatedAt: new Date(),
            }
          : template
      )
    )
  }

  const deleteTemplate = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id))
  }

  const addCustomField = (
    templateId: string,
    field: Omit<TemplateField, 'id'>
  ) => {
    const newField: TemplateField = {
      ...field,
      id: `field-${Date.now()}`,
    }

    setTemplates(
      templates.map((template) =>
        template.id === templateId
          ? {
              ...template,
              fields: [...template.fields, newField],
              updatedAt: new Date(),
            }
          : template
      )
    )
  }

  return {
    templates,
    addTemplate,
    addTemplateWithId,
    updateTemplate,
    deleteTemplate,
    addCustomField,
  }
}
