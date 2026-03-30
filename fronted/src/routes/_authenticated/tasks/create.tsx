import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router'
import { CreateTaskForm } from '@/features/tasks/components/create-task-form'
import { type CreateTaskFormData } from '@/features/tasks/data/schema'


import { z } from 'zod'

// 搜索参数验证schema
const createTaskSearchSchema = z.object({
  editId: z.string().optional(),
  source: z.string().optional(),
  assignee: z.coerce.number().optional(),
  assigner: z.coerce.number().optional(),
  observers: z.string().optional(),
  type: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  estimatedHours: z.coerce.number().optional(),
  parentTask: z.array(z.union([z.string(), z.object({ id: z.string(), title: z.string() })])).optional(),
})

function CreateTaskPage() {
  const navigate = useNavigate()

  const search = useSearch({ from: '/_authenticated/tasks/create' })

  const handleSubmit = async (_data: CreateTaskFormData) => {
    try {
      // 任务创建/更新成功后导航到来源页面或任务列表页面
      // 成功提示已在 CreateTaskForm 组件中处理，无需重复显示
      const targetUrl = search.source || '/tasks'
      navigate({ to: targetUrl })
    } catch (_error) {
      // 错误处理已在 CreateTaskForm 组件中处理
      console.error('Navigation error:', _error)
    }
  }

  const handleCancel = () => {
    const targetUrl = search.source || '/tasks'
    navigate({ to: targetUrl })
  }

  return (
    <div className="create-task-page">
      <CreateTaskForm 
        editId={search.editId}
        initialValues={{
          assignee: search.assignee,
          assigner: search.assigner,
          observers: search.observers,
          type: search.type,
          priority: search.priority,
          estimatedHours: search.estimatedHours,
          parentTask: search.parentTask,
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/tasks/create')({
  validateSearch: createTaskSearchSchema,
  component: CreateTaskPage,
})
