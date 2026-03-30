import { createFileRoute } from '@tanstack/react-router'
import ProjectGraphPage from '@/features/project-graph'

export const Route = createFileRoute('/_authenticated/project-graph')({
  component: ProjectGraphPage,
})
