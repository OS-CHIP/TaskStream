import { createFileRoute } from '@tanstack/react-router'
import ProjectDetail from '@/features/projects/detail'

export const Route = createFileRoute('/_authenticated/projects/$projectId')({
  component: ProjectDetail,
})