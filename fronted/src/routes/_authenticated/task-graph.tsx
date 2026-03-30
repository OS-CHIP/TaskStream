import { createFileRoute } from '@tanstack/react-router'
import TaskGraphPage from '@/features/task-graph'

export const Route = createFileRoute('/_authenticated/task-graph')({
  component: TaskGraphPage,
})