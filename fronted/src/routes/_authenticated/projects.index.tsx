import { createFileRoute } from '@tanstack/react-router'
import Projects from '@/features/projects'

export const Route = createFileRoute('/_authenticated/projects/')({
  component: Projects,
})