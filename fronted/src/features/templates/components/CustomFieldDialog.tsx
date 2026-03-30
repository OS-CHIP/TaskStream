import React, { useEffect, useState } from 'react'
import { TemplateField } from '@/types/templates'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface CustomFieldDialogProps {
  templateId: string
  onAddField: (templateId: string, field: Omit<TemplateField, 'id'>) => void
  trigger: React.ReactNode
  initialField?: Omit<TemplateField, 'id'>
  title?: string
  confirmText?: string
  onConfirm?: (field: Omit<TemplateField, 'id'>) => void
  disableType?: boolean
}

export const CustomFieldDialog: React.FC<CustomFieldDialogProps> = ({
  templateId,
  onAddField,
  trigger,
  initialField,
  title,
  confirmText,
  onConfirm,
  disableType,
}) => {
  const [open, setOpen] = useState(false)
  const [fieldName, setFieldName] = useState('')
  const [fieldType, setFieldType] = useState<TemplateField['type']>('text')
  const [isRequired, setIsRequired] = useState(false)
  // 下拉选项采用 label/value 结构
  const [selectOptions, setSelectOptions] = useState<
    { label: string; value: string }[]
  >([{ label: '', value: '' }])
  // 文件上传类型已取消，相关状态移除
  const [markdownHeight, setMarkdownHeight] = useState(300)
  const [markdownPreview, setMarkdownPreview] = useState<
    'edit' | 'preview' | 'live'
  >('live')
  const [markdownDragbar, setMarkdownDragbar] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (open && initialField) {
      setFieldName(initialField.name || '')
      setFieldType(initialField.type || 'text')
      setIsRequired(!!initialField.required)
      setSelectOptions(
        initialField.options && initialField.options.length
          ? initialField.options
          : [{ label: '', value: '' }]
      )
      setMarkdownHeight(initialField.markdownConfig?.height ?? 300)
      setMarkdownPreview(initialField.markdownConfig?.preview ?? 'live')
      setMarkdownDragbar(initialField.markdownConfig?.visibleDragbar ?? true)
      setShowAdvanced(false)
    }
  }, [open, initialField])

  const handleSubmit = () => {
    if (!fieldName.trim()) return

    const fieldData: Omit<TemplateField, 'id'> = {
      name: fieldName,
      type: fieldType,
      required: isRequired,
    }

    // 根据字段类型添加特定配置
    switch (fieldType) {
      case 'select':
        fieldData.options = selectOptions
          .map((opt) => ({ label: opt.label.trim(), value: opt.value.trim() }))
          .filter((opt) => opt.label && opt.value)
        break

      case 'markdown':
        fieldData.markdownConfig = {
          height: markdownHeight,
          preview: markdownPreview,
          visibleDragbar: markdownDragbar,
        }
        break
    }

    if (onConfirm) {
      onConfirm(fieldData)
    } else {
      onAddField(templateId, fieldData)
    }
    setOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setFieldName('')
    setFieldType('text')
    setIsRequired(false)
    setSelectOptions([{ label: '', value: '' }])
    // 文件上传类型已取消，无需重置相关状态
    setMarkdownHeight(300)
    setMarkdownPreview('live')
    setMarkdownDragbar(true)
    setShowAdvanced(false)
  }

  const renderFieldSpecificOptions = () => {
    switch (fieldType) {
      case 'select':
        return (
          <div className='space-y-2'>
            <Label>下拉选项（可设置 label / value）</Label>
            <div className='space-y-2'>
              {selectOptions.map((opt, idx) => (
                <div key={idx} className='grid grid-cols-1 gap-2 md:grid-cols-3'>
                  <Input
                    placeholder='标签（label）'
                    value={opt.label}
                    onChange={(e) => {
                      const next = [...selectOptions]
                      next[idx] = { ...next[idx], label: e.target.value }
                      setSelectOptions(next)
                    }}
                  />
                  <Input
                    placeholder='值（value）'
                    value={opt.value}
                    onChange={(e) => {
                      const next = [...selectOptions]
                      next[idx] = { ...next[idx], value: e.target.value }
                      setSelectOptions(next)
                    }}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      const next = [...selectOptions]
                      next.splice(idx, 1)
                      setSelectOptions(next.length ? next : [{ label: '', value: '' }])
                    }}
                  >
                    删除
                  </Button>
                </div>
              ))}
            </div>
            <div className='flex gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setSelectOptions([...selectOptions, { label: '', value: '' }])}
              >
                添加选项
              </Button>
            </div>
          </div>
        )

      // 文件上传类型已取消

      case 'markdown':
        return (
          <div className='space-y-3'>
            <button
              type='button'
              onClick={() => setShowAdvanced(!showAdvanced)}
              className='text-muted-foreground hover:text-foreground flex items-center text-sm font-medium'
            >
              {showAdvanced ? (
                <ChevronDown className='mr-2 h-4 w-4' />
              ) : (
                <ChevronRight className='mr-2 h-4 w-4' />
              )}
              编辑器设置
            </button>

            {showAdvanced && (
              <div className='border-muted space-y-3 border-l-2 pl-6'>
                <div className='space-y-2'>
                  <Label htmlFor='markdownHeight'>编辑器高度 (px)</Label>
                  <Input
                    id='markdownHeight'
                    type='number'
                    value={markdownHeight}
                    onChange={(e) => setMarkdownHeight(Number(e.target.value))}
                    min='100'
                    max='1000'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='markdownPreview'>预览模式</Label>
                  <Select
                    value={markdownPreview}
                    onValueChange={(value: 'edit' | 'preview' | 'live') =>
                      setMarkdownPreview(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择预览模式' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='edit'>仅编辑</SelectItem>
                      <SelectItem value='preview'>仅预览</SelectItem>
                      <SelectItem value='live'>实时预览</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='markdownDragbar'
                    checked={markdownDragbar}
                    onCheckedChange={setMarkdownDragbar}
                  />
                  <Label htmlFor='markdownDragbar'>显示拖拽栏</Label>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{title || '添加自定义字段'}</DialogTitle>
        </DialogHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='fieldName'>字段名称</Label>
            <Input
              id='fieldName'
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder='输入字段名称'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='fieldType'>字段类型</Label>
            {disableType ? (
              <div className='rounded-md border px-3 py-2 text-sm'>
                {fieldType}
              </div>
            ) : (
              <Select
                value={fieldType}
                onValueChange={(value) =>
                  setFieldType(value as TemplateField['type'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='选择字段类型' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='text'>文本</SelectItem>
                  <SelectItem value='number'>数字</SelectItem>
                  <SelectItem value='date'>日期</SelectItem>
                  <SelectItem value='select'>下拉选择</SelectItem>
                  <SelectItem value='textarea'>多行文本</SelectItem>
                  <SelectItem value='markdown'>Markdown编辑器</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {/* 字段类型特定的配置选项 */}
          {renderFieldSpecificOptions()}

          <div className='flex items-center space-x-2'>
            <Switch
              id='required'
              checked={isRequired}
              onCheckedChange={setIsRequired}
            />
            <Label htmlFor='required'>是否为必填字段</Label>
          </div>

          <div className='flex justify-end space-x-2 pt-4'>
            <Button variant='outline' onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={!fieldName.trim()}>
              {confirmText || '添加字段'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
