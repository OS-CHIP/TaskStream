import React, { useState } from 'react'
import { Template, TemplateField } from '@/types/templates'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TemplateCard } from './TemplateCard'
import { TemplateForm } from './TemplateForm'

interface TemplateListProps {
  templates: Template[]
  onAddTemplate: (
    template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  onUpdateTemplate: (id: string, template: Partial<Template>) => void
  onDeleteTemplate: (id: string) => void
  onAddField: (templateId: string, field: Omit<TemplateField, 'id'>) => void
}

export const TemplateList: React.FC<TemplateListProps> = ({
  templates,
  onAddTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onAddField,
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  const handleSubmit = (
    templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, templateData)
    } else {
      onAddTemplate(templateData)
    }
    setIsDialogOpen(false)
    setEditingTemplate(null)
  }

  const handleEdit = (template: Template) => {
    setEditingTemplate(template)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingTemplate(null)
    setIsDialogOpen(true)
  }

  const handleCancel = () => {
    setIsDialogOpen(false)
    setEditingTemplate(null)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>模板</h2>
        <Button onClick={handleAdd}>创建新模板</Button>
      </div>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onEdit={handleEdit}
            onDelete={onDeleteTemplate}
            onAddField={onAddField}
          />
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='w-screen'>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? '编辑模板' : '创建新模板'}
            </DialogTitle>
          </DialogHeader>
          <TemplateForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={editingTemplate || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
