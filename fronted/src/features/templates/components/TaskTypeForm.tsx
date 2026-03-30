import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Save, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { TaskType, UpdateTaskTypeRequest, SaveTaskTypeRequest } from '@/types/task-type'
import { taskTypeService } from '../services/task-type-service'
import { useTranslation } from 'react-i18next'

interface TaskTypeFormProps {
  taskType?: TaskType | null
  onSave: () => void
  onCancel: () => void
}

export function TaskTypeForm({ taskType, onSave, onCancel }: TaskTypeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isHidden: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  // 获取项目ID
  const getProjectId = () => {
    const projectId = localStorage.getItem('selected_project_id')
    return projectId ? parseInt(projectId) : null
  }

  // 初始化表单数据
  useEffect(() => {
    if (taskType) {
      setFormData({
        name: taskType.name,
        description: taskType.description || '',
        isHidden:
          typeof taskType.isHidden === 'boolean'
            ? taskType.isHidden
            : taskType.status === 1
              ? false
              : true,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        isHidden: false,
      })
    }
  }, [taskType])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError(t('templatesManagement.form.error.nameRequired'))
      return
    }

    const projectId = getProjectId()
    if (!projectId) {
      setError(t('templatesManagement.form.error.selectProject'))
      return
    }

    try {
      setLoading(true)
      setError(null)

      if (taskType) {
        // 更新任务类型
        const updateData: UpdateTaskTypeRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          // 使用表单中的 isHidden 值
          isHidden: formData.isHidden,
        }
        await taskTypeService.updateTaskType(taskType.id, updateData)
      } else {
        // 创建任务类型（对接保存任务类型模板接口）
        const saveData: SaveTaskTypeRequest = {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          projectId: projectId,
          isHidden: formData.isHidden,
        }
        await taskTypeService.saveTaskType(saveData)
      }

      onSave()
    } catch (err) {
      setError(taskType ? t('templatesManagement.form.error.updateFailed') : t('templatesManagement.form.error.createFailed'))
      console.error('保存任务类型失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 处理输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{taskType ? t('templatesManagement.form.editTitle') : t('templatesManagement.form.createTitle')}</CardTitle>
        <CardDescription>
          {taskType ? t('templatesManagement.form.editDesc') : t('templatesManagement.form.createDesc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">{t('templatesManagement.form.fields.name')}</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={t('templatesManagement.form.fields.namePlaceholder')}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('templatesManagement.form.fields.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={t('templatesManagement.form.fields.descriptionPlaceholder')}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isHidden"
              checked={formData.isHidden}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isHidden: checked }))
              }
              disabled={loading}
            />
            <Label htmlFor="isHidden">{t('templatesManagement.form.fields.isHidden')}</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              {t('templatesManagement.form.buttons.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('templatesManagement.form.buttons.saving')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {taskType ? t('templatesManagement.form.buttons.update') : t('templatesManagement.form.buttons.create')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
