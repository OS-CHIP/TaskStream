import { FileText, Search, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  type: 'no-selection' | 'no-results' | 'no-tasks'
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

// 图标映射
const iconMap = {
  'no-selection': FileText,
  'no-results': Search,
  'no-tasks': Inbox,
} as const

export default function EmptyState({
  type,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  const Icon = iconMap[type]

  return (
    <div className={cn(
      'flex flex-col items-center justify-center h-full text-center p-8',
      className
    )}>
      {/* 图标 */}
      <div className="mb-4">
        <Icon className="h-12 w-12 text-muted-foreground/50" />
      </div>
      
      {/* 标题 */}
      <h3 className="text-lg font-medium text-foreground mb-2">
        {title}
      </h3>
      
      {/* 描述 */}
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      
      {/* 操作按钮 */}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  )
}