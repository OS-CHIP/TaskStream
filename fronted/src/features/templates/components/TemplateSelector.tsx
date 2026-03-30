import React from 'react'
import { Template } from '@/types/templates'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface TemplateSelectorProps {
  templates: Template[]
  onSelect: (template: Template) => void
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelect,
}) => {
  // 按类型分组模板
  const groupedTemplates = templates.reduce(
    (acc, template) => {
      if (!acc[template.type]) {
        acc[template.type] = []
      }
      acc[template.type].push(template)
      return acc
    },
    {} as Record<string, Template[]>
  )

  return (
    <div className='space-y-6 overflow-auto'>
      {/* <h2 className='text-2xl font-bold'>选择模板创建实例</h2> */}

      {Object.entries(groupedTemplates).map(([type, typeTemplates]) => (
        <div key={type} className='space-y-4'>
          <h3 className='text-muted-foreground text-xl font-semibold'>
            {type}
          </h3>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {typeTemplates.map((template) => (
              <Card
                key={template.id}
                className='transition-shadow hover:shadow-md'
              >
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-4 text-sm'>
                    包含 {template.fields.length} 个字段
                  </p>
                  <Button onClick={() => onSelect(template)}>使用此模板</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
