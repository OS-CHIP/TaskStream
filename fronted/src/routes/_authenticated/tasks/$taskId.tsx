import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TaskDetailPage } from '@/features/tasks/components/task-detail-page'

// 搜索参数验证schema
const taskDetailSearchSchema = z.object({
  tab: z.string().optional(),
  comment: z.string().optional(),
  from: z.string().optional(),
  page: z.coerce.number().optional(),
})

export const Route = createFileRoute('/_authenticated/tasks/$taskId')({
  validateSearch: taskDetailSearchSchema,
  component: TaskDetailPage,
})
