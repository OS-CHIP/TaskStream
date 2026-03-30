import { useNavigate } from '@tanstack/react-router'
import { IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

export function TasksPrimaryButtons() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
        onClick={() =>
          navigate({
            from: '/tasks',
            to: '/tasks/create',
          })
        }
      >
        <span>{t('common.create')}</span> <IconPlus size={18} />
      </Button>
    </div>
  )
}
