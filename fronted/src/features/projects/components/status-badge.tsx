import { useTranslation } from 'react-i18next'
import type { Status } from '../types'
import '@/features/projects/i18n/register'

export function StatusBadge({ value }: { value: Status }) {
  const { t } = useTranslation()
  const text = value === '1' ? t('projects.status.1') : t('projects.status.2')
  return (
    <span className="rounded border px-1.5 py-0.5">
      {text}
    </span>
  )
}
