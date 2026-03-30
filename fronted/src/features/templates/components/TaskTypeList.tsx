import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { taskTypeService } from '../services/task-type-service'
import type { TaskType } from '@/types/task-type'
import { showSuccess } from '@/utils/error-handler'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TaskTypeListProps {
  onEdit: (taskType: TaskType) => void
  onCreate: () => void
}

export function TaskTypeList({ onEdit, onCreate }: TaskTypeListProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskTypeToDelete, setTaskTypeToDelete] = useState<TaskType | null>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 获取项目ID
  const getProjectId = () => {
    const projectId = localStorage.getItem('selected_project_id')
    return projectId ? parseInt(projectId) : 1
  }

  // 加载任务类型列表
  const loadTaskTypes = async () => {
    try {
      setLoading(true)
      const projectId = getProjectId()
      const data = await taskTypeService.getTaskTypeList(projectId)
      setTaskTypes(data.filter((tt) => !(tt.projectId == 0)))
    } catch (error) {
      console.error('加载任务类型失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除任务类型
  const handleDelete = async () => {
    if (!taskTypeToDelete) return

    try {
      await taskTypeService.deleteTaskType(taskTypeToDelete.id)
      showSuccess(t('templatesManagement.list.deleteDialog.success', { name: taskTypeToDelete.name }))
      loadTaskTypes()
    } catch (error) {
      console.error('删除任务类型失败:', error)
    } finally {
      setDeleteDialogOpen(false)
      setTaskTypeToDelete(null)
    }
  }

  // 打开删除确认对话框
  const openDeleteDialog = (taskType: TaskType) => {
    setTaskTypeToDelete(taskType)
    setDeleteDialogOpen(true)
  }

  // 过滤任务类型
  const filteredTaskTypes = taskTypes.filter(taskType =>
    taskType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    taskType.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    loadTaskTypes()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('templatesManagement.list.title')}</CardTitle>
              <CardDescription>{t('templatesManagement.list.description')}</CardDescription>
            </div>
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              {t('templatesManagement.list.create')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索栏 */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('templatesManagement.list.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* 任务类型列表 */}
          {filteredTaskTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? t('templatesManagement.list.noMatch') : t('templatesManagement.list.empty')}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('templatesManagement.list.table.name')}</TableHead>
                    <TableHead>{t('templatesManagement.list.table.description')}</TableHead>
                    <TableHead>{t('templatesManagement.list.table.status')}</TableHead>
                    <TableHead className="text-right">{t('templatesManagement.list.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTaskTypes.map((taskType) => (
                    <TableRow key={taskType.id}>
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => navigate({ to: `/templates/detail/${taskType.id}` })}
                        >
                          {taskType.name}
                        </button>
                      </TableCell>
                      <TableCell>{taskType.description}</TableCell>
                      <TableCell>
                        <Badge variant={taskType.status === 1 ? 'default' : 'secondary'}>
                          {taskType.status === 1
                            ? t('templatesManagement.list.status.enabled')
                            : t('templatesManagement.list.status.disabled')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(taskType)}
                          >
                            <Edit className="h-4 w-4" />
                            {t('templatesManagement.list.actions.edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate({ to: `/templates/detail/${taskType.id}` })}
                          >
                            {t('templatesManagement.list.actions.configTemplate')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(taskType)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('templatesManagement.list.actions.delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        handleConfirm={handleDelete}
        title={t('templatesManagement.list.deleteDialog.title')}
        desc={t('templatesManagement.list.deleteDialog.desc', { name: taskTypeToDelete?.name ?? '' })}
        confirmText={t('templatesManagement.list.deleteDialog.confirm')}
        cancelBtnText={t('templatesManagement.list.deleteDialog.cancel')}
        destructive
      />
    </>
  )
}
