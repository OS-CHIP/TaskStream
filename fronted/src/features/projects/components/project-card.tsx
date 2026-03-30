import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconDotsVertical } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { VisibilityBadge } from './visibility-badge'
import { StatusBadge } from './status-badge'
import type { Project } from '../types'
import { cardHover } from '../utils/animations'
import '@/features/projects/i18n/register'

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onCreateSubproject,
  onLink,
}: {
  project: Project
  onEdit: () => void
  onDelete: () => void
  onCreateSubproject: () => void
  onLink?: () => void
}) {
  const { t } = useTranslation()
  return (
    <Card className={cardHover}>
      <CardHeader className="space-y-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-none truncate min-w-0">
            <Link
              to="/projects/$projectId"
              params={{ projectId: project.id }}
              className="hover:underline block truncate"
              title={project.name}
            >
              {project.name}
            </Link>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More">
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={onCreateSubproject}>
                {t('projects.card.createSub', { defaultValue: '创建子项目' })}
              </DropdownMenuItem>
              {onLink && (
                <DropdownMenuItem onClick={onLink}>
                  {t('projects.relation.link')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={onEdit}>{t('projects.card.edit')}</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                {t('projects.card.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground line-clamp-2">
          {project.description || '—'}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="rounded border px-1.5 py-0.5">{t('projects.card.key')}: {project.key}</span>
          <StatusBadge value={project.status} />
          <VisibilityBadge value={(project.visibility || 'private') as import('../types').Visibility} />
        </div>
      </CardContent>
    </Card>
  )
}
