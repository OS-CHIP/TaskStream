import { Badge } from '@/components/ui/badge'
import type { Visibility } from '../types'
import { useTranslation } from 'react-i18next'

export function VisibilityBadge({ value, className }: { value: Visibility; className?: string }) {
  const { t } = useTranslation()
  const label =
    value === 'private'
      ? t('projects.visibility.private')
      : value === 'internal'
      ? t('projects.visibility.internal')
      : t('projects.visibility.public')
  // 变体可按需微调
  const variant: 'default' | 'secondary' | 'outline' =
    value === 'private' ? 'secondary' : value === 'internal' ? 'outline' : 'default'
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
