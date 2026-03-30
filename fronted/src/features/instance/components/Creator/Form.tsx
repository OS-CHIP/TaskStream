import React from 'react'
import { Template } from '@/types/templates'
import { Button } from '@/components/ui/button'
import { FieldRenderer } from '@/features/templates/components/FieldRenderer'

interface InstanceFormProps {
  template: Template
  fieldValues: Record<string, unknown>
  errors: string[]
  isSubmitting: boolean
  onFieldChange: (fieldId: string, value: unknown) => void
  onSubmit: () => void
  onCancel?: () => void
  submitLabel?: string
  showCancel?: boolean
}

export const InstanceForm: React.FC<InstanceFormProps> = ({
  template,
  fieldValues,
  errors,
  isSubmitting,
  onFieldChange,
  onSubmit,
  onCancel,
  submitLabel = '创建',
  showCancel = true,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* 模板字段 */}
      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
          {template.fields.map((field) => (
            <div
              key={field.id}
              className={
                field.type === 'textarea' ||
                field.type === 'markdown'
                  ? 'md:col-span-2'
                  : ''
              }
            >
              <FieldRenderer
                field={field}
                value={fieldValues[field.id] || ''}
                onChange={onFieldChange}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 错误信息 */}
      {errors.length > 0 && (
        <div className='rounded-lg border border-red-200 bg-red-50 p-4'>
          <h4 className='mb-2 font-medium text-red-800'>请解决以下问题：</h4>
          <ul className='list-inside list-disc space-y-1 text-red-700'>
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 操作按钮 */}
      <div className='flex justify-end space-x-3 border-t pt-6'>
        {showCancel && onCancel && (
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
        )}
        <Button type='submit' disabled={isSubmitting} className='min-w-20'>
          {isSubmitting ? '创建中...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
