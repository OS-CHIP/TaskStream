import { createFileRoute } from '@tanstack/react-router'
import ProjectOverview from '@/features/projects/overview'

export const Route = createFileRoute('/_authenticated/project-overview')({
  component: ProjectOverview,
})
