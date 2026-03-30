import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { TaskTypeList } from '@/features/templates/components/TaskTypeList'
import { TaskTypeForm } from '@/features/templates/components/TaskTypeForm'
import { TaskType } from '@/types/task-type'
import '@/features/templates/i18n/register'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

function TemplateManagementComponent() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTaskType, setEditingTaskType] = useState<TaskType | null>(null)

  // 处理创建新任务类型
  const handleCreate = () => {
    setEditingTaskType(null)
    setIsFormOpen(true)
  }

  // 处理编辑任务类型
  const handleEdit = (taskType: TaskType) => {
    setEditingTaskType(taskType)
    setIsFormOpen(true)
  }

  // 处理保存完成
  const handleSave = () => {
    setIsFormOpen(false)
    setEditingTaskType(null)
  }

  // 处理取消
  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingTaskType(null)
  }

  return (
    <>
      <AppHeader fixed />
      <Main className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {isFormOpen ? (
            <TaskTypeForm
              taskType={editingTaskType}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <TaskTypeList
              onEdit={handleEdit}
              onCreate={handleCreate}
            />
          )}
        </div>
      </Main>
    </>
  )
}

export const Route = createFileRoute('/_authenticated/templates/management')({
  component: TemplateManagementComponent,
})
