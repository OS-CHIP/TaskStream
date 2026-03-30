import React, { useState } from 'react'
import { TemplateField } from '@/types/templates'
import MDEditor from '@uiw/react-md-editor'
import { Eye, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface MarkdownFieldProps {
  field: TemplateField
  value: unknown
  onChange: (fieldId: string, value: unknown) => void
}

export const MarkdownField: React.FC<MarkdownFieldProps> = ({
  field,
  value,
  onChange,
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  const [showSettings] = useState(false)

  const editorConfig = field.markdownConfig || {}
  const editorHeight = editorConfig.height || 300
  const stringValue = typeof value === 'string' ? value : ''
  const components = {
    img: (props: any) => (
      <img {...props} referrerPolicy="no-referrer" crossOrigin="anonymous" />
    ),
  }

  const handleChange = (newValue?: string) => {
    onChange(field.id, newValue || '')
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === 'edit' ? 'preview' : 'edit')
  }

  // const toggleSettings = () => {
  //   setShowSettings(!showSettings)
  // }

  return (
    <div className='space-y-3' data-color-mode='light'>
      <div className='flex items-center justify-between'>
        <Label htmlFor={field.id}>
          {field.name}
          {field.required && <span className='ml-1 text-red-500'>*</span>}
        </Label>

        <div className='flex items-center space-x-2'>
          {/* <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={toggleSettings}
            title='编辑器设置'
          >
            <Settings className='h-4 w-4' />
          </Button> */}

          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={toggleViewMode}
          >
            {viewMode === 'edit' ? (
              <>
                <Eye className='mr-2 h-4 w-4' />
                预览
              </>
            ) : (
              <>
                <Edit className='mr-2 h-4 w-4' />
                编辑
              </>
            )}
          </Button>
        </div>
      </div>

      {showSettings && (
        <div className='bg-muted rounded-lg border p-3'>
          <h4 className='mb-2 text-sm font-medium'>编辑器设置</h4>
          <div className='text-muted-foreground text-xs'>
            当前模式: {viewMode === 'edit' ? '编辑模式' : '预览模式'}
            <br />
            编辑器高度: {editorHeight}px
          </div>
        </div>
      )}

      <div className='overflow-hidden rounded-lg border'>
        {viewMode === 'edit' ? (
          <MDEditor
            value={stringValue}
            onChange={handleChange}
            height={editorHeight}
            preview={editorConfig.preview || 'live'}
            visibleDragbar={editorConfig.visibleDragbar ?? true}
            hideToolbar={false}
            // placeholder='开始输入Markdown内容...'
            textareaProps={{
              style: {
                fontSize: 14,
                lineHeight: 1.5,
                fontFamily: 'inherit',
              },
            }}
            data-color-mode='light'
          />
        ) : (
          <div className='p-4' style={{ minHeight: editorHeight }}>
            {stringValue ? (
              <MDEditor.Markdown
                source={stringValue}
                style={{
                  padding: 0,
                  background: 'transparent',
                  fontFamily: 'inherit',
                }}
                components={components}
              />
            ) : (
              <div className='text-muted-foreground py-8 text-center'>
                暂无内容，点击"编辑"按钮开始编写
              </div>
            )}
          </div>
        )}
      </div>

      {/* 字数统计 */}
      <div className='text-muted-foreground text-right text-xs'>
        字数: {stringValue.length || 0} | 行数:{' '}
        {stringValue ? stringValue.split('\n').length : 0}
      </div>
    </div>
  )
}
