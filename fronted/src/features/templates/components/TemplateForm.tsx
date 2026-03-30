import React, { useState, useEffect } from 'react'
import { Template, TemplateType, TemplateField } from '@/types/templates'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { CustomFieldDialog } from './CustomFieldDialog'
import { FieldEditor } from './FieldEditor'
import { showSuccess } from '@/utils/error-handler'

interface TemplateFormProps {
  onSubmit: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel?: () => void
  initialData?: Template
  // 仅渲染字段配置区域（隐藏名称/类型/描述）
  fieldsOnly?: boolean
  onAddFieldRemote?: (field: Omit<TemplateField, 'id'>, sort: number) => Promise<void>
  onRemoveFieldRemote?: (field: TemplateField) => Promise<string | void>
  onEditFieldRemote?: (field: TemplateField, sort: number) => Promise<void>
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  fieldsOnly = false,
  onAddFieldRemote,
  onRemoveFieldRemote,
  onEditFieldRemote,
}) => {
  const [name, setName] = useState(initialData?.name || '')
  const [type, setType] = useState<TemplateType>(
    initialData?.type || 'requirement'
  )
  const [description, setDescription] = useState(initialData?.description || '')
  const [fields, setFields] = useState<TemplateField[]>(
    initialData?.fields || []
  )

  // 当initialData变化时，更新fields状态
  useEffect(() => {
    if (initialData?.fields) {
      setFields(initialData.fields)
    }
  }, [initialData?.fields])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (fieldsOnly) return
    if (!name.trim()) return

    onSubmit({
      name,
      type,
      description,
      fields,
    })
  }

  const addField = (field: Omit<TemplateField, 'id'>) => {
    const newField: TemplateField = {
      ...field,
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    setFields([...fields, newField])
  }

  const updateField = (index: number, field: TemplateField) => {
    const newFields = [...fields]
    newFields[index] = field
    setFields(newFields)
  }

  const removeField = async (index: number) => {
    const target = fields[index]
    if (onRemoveFieldRemote && target) {
      try {
        console.log('[TemplateForm.removeField] 远端删除尝试:', target)
        const msg = await onRemoveFieldRemote(target)
        showSuccess(typeof msg === 'string' ? msg : '删除成功')
        // 远端删除后，会通过API获取最新列表并更新initialData，
        // 然后通过useEffect自动更新fields状态，所以不需要手动更新
      } catch (e) {
        console.error('[TemplateForm.removeField] 远端删除失败:', e)
        return
      }
    } else {
      // 只有当没有远端删除时，才手动更新本地fields状态
      const newFields = [...fields]
      newFields.splice(index, 1)
      setFields(newFields)
    }
  }

  return (
    <form onSubmit={fieldsOnly ? undefined : handleSubmit} className='flex h-full w-full flex-col gap-6 overflow-hidden'>
      {!fieldsOnly && (
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>模板名称</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='输入模板名称'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='type'>模板类型</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as TemplateType)}
            >
              <SelectTrigger>
                <SelectValue placeholder='选择模板类型' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='requirement'>需求</SelectItem>
                <SelectItem value='task'>任务</SelectItem>
                <SelectItem value='bug'>Bug</SelectItem>
                <SelectItem value='test'>测试验证</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>模板描述</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='输入模板描述'
              rows={3}
            />
          </div>
        </div>
      )}

      <div className='flex min-h-0 flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <Label>字段配置</Label>
          <CustomFieldDialog
            templateId='new'
            onAddField={(_, field) => {
              const nextSort = fields.length + 1
              console.log('[TemplateForm.onAddField] 新字段:', field, 'sort:', nextSort)
              addField(field)
              if (onAddFieldRemote) {
                void onAddFieldRemote(field, nextSort)
              }
            }}
            trigger={
              <Button type='button' variant='outline' size='sm'>
                <Plus className='mr-2 h-4 w-4' />
                添加字段
              </Button>
            }
          />
        </div>

        <div className='flex-1 min-h-0 space-y-4 overflow-y-auto p-1'>
          {fields.length === 0 ? (
            <div className='text-muted-foreground rounded-lg border py-8 text-center'>
              暂无字段，请添加字段
            </div>
          ) : (
            fields.map((field, index) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={index}
                onUpdate={updateField}
                onRemove={removeField}
                onEditFieldRemote={onEditFieldRemote}
              />
            ))
          )}
        </div>
      </div>

      <div className='mt-auto flex justify-end space-x-2 pt-4'>
        {onCancel && (
          <Button type='button' variant='outline' onClick={onCancel}>
            返回
          </Button>
        )}
        {!fieldsOnly && (
          <Button type='submit'>{initialData ? '更新' : '创建'}</Button>
        )}
      </div>
    </form>
  )
}
