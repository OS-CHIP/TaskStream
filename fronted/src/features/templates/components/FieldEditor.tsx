import React, { useState } from 'react'
import { TemplateField, fieldTypes } from '@/types/templates'
import { Trash2, GripVertical, SquarePen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CustomFieldDialog } from './CustomFieldDialog'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface FieldEditorProps {
  field: TemplateField
  index: number
  onUpdate: (index: number, field: TemplateField) => void
  onRemove: (index: number) => void
  onEditFieldRemote?: (field: TemplateField, sort: number) => Promise<void>
}

export const FieldEditor: React.FC<FieldEditorProps> = ({
  field,
  index,
  onUpdate,
  onRemove,
  onEditFieldRemote,
}) => {
  const [fieldData, setFieldData] = useState<TemplateField>(field)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const typeLabel = fieldTypes.find((t) => t.value === fieldData.type)?.label || fieldData.type

  const handleConfirm = async (updated: Omit<TemplateField, 'id'>) => {
    const merged: TemplateField = { ...fieldData, ...updated }
    setFieldData(merged)
    onUpdate(index, merged)
    if (onEditFieldRemote) {
      try {
        await onEditFieldRemote(merged, index + 1)
      } catch {}
    }
  }

  const handleDeleteConfirm = () => {
    onRemove(index)
    setDeleteDialogOpen(false)
  }

  return (
    <div className='bg-card space-y-4 rounded-lg border p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <GripVertical className='text-muted-foreground h-4 w-4' />
          <h4 className='font-medium'>字段 {index + 1}</h4>
        </div>
        <div className='flex items-center gap-2'>
          <CustomFieldDialog
            templateId='edit'
            trigger={
              <Button type='button' variant='ghost' size='icon' aria-label='编辑字段'>
                <SquarePen className='h-4 w-4' />
              </Button>
            }
            initialField={{
              name: fieldData.name,
              type: fieldData.type,
              required: fieldData.required,
              options: fieldData.options,
              markdownConfig: fieldData.markdownConfig,
            }}
            title='编辑字段'
            confirmText='保存'
            onConfirm={handleConfirm}
            onAddField={() => {}}
            disableType
          />
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={() => {
              setDeleteDialogOpen(true)
            }}
            className='text-destructive hover:text-destructive hover:bg-destructive/10'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleDeleteConfirm}
        title="删除字段"
        desc={`确定要删除字段 "${fieldData.name}" 吗？此操作不可恢复。`}
        confirmText="删除"
        cancelBtnText="取消"
        destructive
      />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='space-y-1'>
          <Label>名称</Label>
          <div>{fieldData.name}</div>
        </div>
        <div className='space-y-1'>
          <Label>类型</Label>
          <div>{typeLabel}</div>
        </div>
        <div className='space-y-1'>
          <Label>必填</Label>
          <div>{fieldData.required ? '是' : '否'}</div>
        </div>
      </div>

      {fieldData.type === 'select' && fieldData.options && fieldData.options.length > 0 && (
        <div className='space-y-2'>
          <Label>下拉选项</Label>
          <div className='space-y-1'>
            {fieldData.options.map((opt, idx) => (
              <div key={idx}>{opt.label} / {opt.value}</div>
            ))}
          </div>
        </div>
      )}

      {fieldData.type === 'markdown' && (
        <div className='space-y-2'>
          <Label>Markdown 设置</Label>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
            <div className='space-y-1'>
              <Label>高度</Label>
              <div>{fieldData.markdownConfig?.height ?? 300}</div>
            </div>
            <div className='space-y-1'>
              <Label>预览</Label>
              <div>{fieldData.markdownConfig?.preview ?? 'live'}</div>
            </div>
            <div className='space-y-1'>
              <Label>拖拽栏</Label>
              <div>{(fieldData.markdownConfig?.visibleDragbar ?? true) ? '是' : '否'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
