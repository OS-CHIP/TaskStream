import React from 'react'
import { Template } from '@/types/templates'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InstanceHeaderProps {
  template: Template
  onBack?: () => void
  onSaveDraft?: () => void
  mode: 'page' | 'embedded'
}

export const InstanceHeader: React.FC<InstanceHeaderProps> = ({
  template,
  onBack,
  onSaveDraft,
  mode,
}) => {
  const getTypeLabel = (type: string) => {
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
    <div className={`${mode === 'page' ? 'mb-6 border-b pb-6' : 'pb-4'}`}>
      <div className='flex justify-between'>
        {mode === 'page' && onBack && (
          <Button variant='ghost' onClick={onBack} className='mb-4' size='sm'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            返回
          </Button>
        )}

        {onSaveDraft && (
          <Button variant='outline' onClick={onSaveDraft} size='sm'>
            <Save className='mr-2 h-4 w-4' />
            保存草稿
          </Button>
        )}
      </div>

      <div className='flex items-start justify-between'>
        <div>
          <p className='text-muted-foreground mt-1'>
            {getTypeLabel(template.type)} · {mode === 'page' ? '创建' : ''}{' '}
            {template.name}
          </p>
        </div>
      </div>
    </div>
  )
}
