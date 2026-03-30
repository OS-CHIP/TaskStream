import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  icon: ReactNode
  onClick: () => void
  color: string
}

export function QuickAction({ title, icon, onClick, color }: Props) {
  return (
    <Button
      onClick={onClick}
      className={`quick-action-btn ${color} mr-3 mb-3`}
      size="sm"
    >
      {icon}
      <span className="ml-2">{title}</span>
    </Button>
  )
}
