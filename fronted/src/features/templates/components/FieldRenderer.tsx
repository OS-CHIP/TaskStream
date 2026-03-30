import React from 'react'
import { TemplateField } from '@/types/templates'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
// 文件上传字段已取消
import { MarkdownEditorField } from '@/features/tasks/components/markdown-editor'

// import { MarkdownField } from './MarkdownField';

interface FieldRendererProps {
  field: TemplateField
  value: unknown
  onChange: (fieldId: string, value: unknown) => void
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
}) => {
  const handleChange = (newValue: unknown) => {
    onChange(field.id, newValue)
  }

  // 将unknown类型转换为适当的类型用于UI组件
  const stringValue = typeof value === 'string' ? value : ''
  const numberValue = typeof value === 'number' ? value : undefined
  const dateValue = value instanceof Date ? value : undefined

  // 文件上传字段已取消，不再渲染

  // Markdown编辑器字段（与任务描述一致的编辑器与交互）
  if (field.type === 'markdown') {
    return (
      <div className='space-y-2'>
        <Label htmlFor={field.id}>
          {field.name}
          {field.required && <span className='ml-1 text-red-500'>*</span>}
        </Label>
        <MarkdownEditorField
          field={{
            value: typeof value === 'string' ? value : '',
            onChange: (val?: string) => onChange(field.id, val || ''),
            name: field.id,
          }}
          fieldState={{}}
          label={field.name}
        />
      </div>
    )
  }

  switch (field.type) {
    case 'text':
      return (
        <div className='space-y-2'>
          <Label htmlFor={field.id}>
            {field.name}
            {field.required && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Input
            id={field.id}
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
          />
        </div>
      )

    case 'textarea':
      return (
        <div className='space-y-2'>
          <Label htmlFor={field.id}>
            {field.name}
            {field.required && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Textarea
            id={field.id}
            value={stringValue}
            onChange={(e) => handleChange(e.target.value)}
            required={field.required}
            rows={4}
          />
        </div>
      )

    case 'number':
      return (
        <div className='space-y-2'>
          <Label htmlFor={field.id}>
            {field.name}
            {field.required && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Input
            id={field.id}
            type='number'
            value={numberValue}
            onChange={(e) => handleChange(Number(e.target.value))}
            required={field.required}
          />
        </div>
      )

    case 'date':
      return (
        <div className='space-y-2'>
          <Label htmlFor={field.id}>
            {field.name}
            {field.required && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={cn('w-full pl-3 text-left font-normal user-input-display', !dateValue && 'text-muted-foreground')}
              >
                {dateValue ? (
                  format(dateValue, 'yyyy-MM-dd')
                ) : (
                  <span>{`请选择${field.name}`}</span>
                )}
                <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0' align='start'>
              <Calendar
                mode='single'
                selected={dateValue}
                onSelect={(date) => {
                  if (date) {
                    const newDate = new Date(date)
                    newDate.setHours(0, 0, 0, 0)
                    handleChange(newDate)
                  }
                }}
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      )

    case 'select':
      return (
        <div className='space-y-2'>
          <Label htmlFor={field.id}>
            {field.name}
            {field.required && <span className='ml-1 text-red-500'>*</span>}
          </Label>
          <Select value={stringValue} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue placeholder={`请选择${field.name}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )

    default:
      return null
  }
}
