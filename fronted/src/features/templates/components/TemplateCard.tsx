import React from 'react'
import { Template, TemplateField } from '@/types/templates'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CustomFieldDialog } from './CustomFieldDialog'

interface TemplateCardProps {
  template: Template
  onEdit: (template: Template) => void
  onDelete: (id: string) => void
  onAddField: (templateId: string, field: Omit<TemplateField, 'id'>) => void
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onEdit,
  onDelete,
  onAddField,
}) => {
  const getTypeLabel = (type: Template['type']) => {
    switch (type) {
      case 'requirement':
        return '需求'
      case 'task':
        return '任务'
      case 'bug':
        return 'Bug'
      case 'test':
        return '测试'
      default:
        return type
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>
          {getTypeLabel(template.type)} - {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          <h4 className='font-medium'>字段列表:</h4>
          <ul className='text-muted-foreground list-inside list-disc text-sm'>
            {template.fields.map((field) => (
              <li key={field.id}>
                {field.name} ({field.type}) {field.required && '*'}
              </li>
            ))}
          </ul>
        </div>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Button variant='outline' size='sm' onClick={() => onEdit(template)}>
            编辑
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => onDelete(template.id)}
          >
            删除
          </Button>
          <CustomFieldDialog
            templateId={template.id}
            onAddField={onAddField}
            trigger={
              <Button variant='outline' size='sm'>
                添加字段
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  )
}
