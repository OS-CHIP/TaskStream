import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import MyTasksPage from '@/features/my-tasks'

// 搜索参数验证schema
const myTasksSearchSchema = z.object({
  taskId: z.coerce.string().optional(),
})

export const Route = createFileRoute('/_authenticated/my-tasks')({
  validateSearch: myTasksSearchSchema,
  component: MyTasksPage,
})