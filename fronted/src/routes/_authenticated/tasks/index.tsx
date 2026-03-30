import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import Tasks from '@/features/tasks'

const tasksSearchSchema = z.object({
  page: z.coerce.number().optional().default(1),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: tasksSearchSchema,
  component: Tasks,
})
