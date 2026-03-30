import { createFileRoute } from '@tanstack/react-router'
import { ProjectLoader } from '@/components/project-loader'

export const Route = createFileRoute('/_authenticated/')({
  component: () => <ProjectLoader redirectTo="/tasks" />,
})
