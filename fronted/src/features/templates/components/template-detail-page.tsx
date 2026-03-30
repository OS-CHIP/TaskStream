import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Template } from '@/types/templates'
import { useTemplates } from '@/hooks/useTemplates'
import { taskTypeService } from '../services/task-type-service'
// 移除错误提示组件，页面仅保留字段配置
import { useTranslation } from 'react-i18next'
import '@/features/templates/i18n/register'

/**
 * 模板详情编辑页面
 * - 从任务类型列表进入
 * - 支持自定义 input / textarea / select(含options) / date(日历) 等字段
 * - 每个字段支持自定义 label
 */
export function TemplateDetailPage() {
  const { taskTypeId } = useParams({ from: '/_authenticated/templates/detail/$taskTypeId' })
  const navigate = useNavigate()
  const { t } = useTranslation()

  const numericTaskTypeId = useMemo(() => {
    const id = Number(taskTypeId)
    return Number.isFinite(id) ? id : null
  }, [taskTypeId])

  const { templates, addTemplateWithId, updateTemplate } = useTemplates()
  const [loading, setLoading] = useState(true)
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null)

  // 根据任务类型ID生成模板ID（前端本地模板标识）
  const templateIdKey = useMemo(() => {
    return numericTaskTypeId ? `taskType-${numericTaskTypeId}` : null
  }, [numericTaskTypeId])

  // 加载任务类型详情，并初始化/获取对应模板（失败时降级为本地占位）
  const initializedTaskTypeIdRef = useRef<number | null>(null)
  useEffect(() => {
    const init = async () => {
      if (!numericTaskTypeId) {
        setLoading(false)
        return
      }

      // 防止因 React 严格模式或依赖变化导致的重复初始化
      if (initializedTaskTypeIdRef.current === numericTaskTypeId) {
        return
      }
      initializedTaskTypeIdRef.current = numericTaskTypeId

      setLoading(true)

      try {
        // 名称降级为占位（仅字段编辑页，字段回显为主）
        const name = `${t('templatesManagement.detail.namePrefix')} ${numericTaskTypeId}`
        const desc = ''

        // 如果不存在对应模板则初始化一个
        if (templateIdKey && !templates.find((t) => t.id === templateIdKey)) {
          addTemplateWithId({
            id: templateIdKey,
            name: `${name} ${t('templatesManagement.detail.templateSuffix')}`,
            type: 'task',
            description: desc,
            fields: [],
          })
        }

        // 拉取后端动态字段并进行回显（仅一次请求）
        try {
          const fetched = await taskTypeService.getTemplateFields(numericTaskTypeId)
          if (templateIdKey) {
            updateTemplate(templateIdKey, {
              name: `${name} ${t('templatesManagement.detail.templateSuffix')}`,
              type: 'task',
              description: desc,
              fields: fetched,
            })
            // 本地状态直接设置，避免依赖 templates 造成的重复初始化
            setCurrentTemplate({
              id: templateIdKey,
              name: `${name} ${t('templatesManagement.detail.templateSuffix')}`,
              type: 'task',
              description: desc,
              fields: fetched,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        } catch (err) {
          console.error('获取模板下的动态字段失败，保持空字段以继续编辑', err)
          // 回退为占位模板，避免页面空白
          if (templateIdKey) {
            setCurrentTemplate({
              id: templateIdKey,
              name: `${name} ${t('templatesManagement.detail.templateSuffix')}`,
              type: 'task',
              description: desc,
              fields: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        }
      } finally {
        setLoading(false)
      }
    }

    void init()
  }, [numericTaskTypeId])

  const handleSubmit = async (updated: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentTemplate) return

    // 本地更新，保证前端状态一致
    updateTemplate(currentTemplate.id, {
      name: updated.name,
      type: updated.type,
      description: updated.description,
      fields: updated.fields,
    })

    navigate({ to: '/templates/management' })
  }

  const handleAddFieldRemote = async (field: Omit<Template['fields'][number], 'id'>, sort: number) => {
    if (!numericTaskTypeId) return
    const mappedType = field.type === 'markdown' ? 'markdown' : field.type
    const isSelect = mappedType === 'select'
    const optionsStr = isSelect
      ? (() => {
          if (Array.isArray(field.options) && field.options.length > 0) {
            const normalized = (field.options as any[])
              .map((opt: any) => {
                if (typeof opt === 'string') {
                  const s = opt.trim()
                  return s ? { label: s, value: s } : null
                }
                const label = typeof opt.label === 'string' ? opt.label.trim() : String(opt.label ?? '')
                const value = typeof opt.value === 'string' ? opt.value.trim() : String(opt.value ?? label)
                if (!label && !value) return null
                return { label, value }
              })
              .filter(Boolean)
            return normalized.length > 0 ? JSON.stringify(normalized) : null
          }
          return null
        })()
      : null

    const payload = {
        taskTypeId: numericTaskTypeId,
        name: field.name,
        type: mappedType,
        label: field.name,
        isRequired: !!field.required,
        isHidden: false,
        options: optionsStr,
        sort
    }
    console.log('[TemplateDetailPage.handleAddFieldRemote] 请求参数:', payload)
    try {
      await taskTypeService.saveCustomFields(payload)
    } catch {}
  }

  const handleEditFieldRemote = async (field: Template['fields'][number], sort: number) => {
    if (!numericTaskTypeId) return
    const mappedType = field.type === 'markdown' ? 'markdown' : field.type
    const isSelect = mappedType === 'select'
    const optionsStr = isSelect
      ? (() => {
          if (Array.isArray(field.options) && field.options.length > 0) {
            const normalized = (field.options as any[])
              .map((opt: any) => {
                if (typeof opt === 'string') {
                  const s = opt.trim()
                  return s ? { label: s, value: s } : null
                }
                const label = typeof opt.label === 'string' ? opt.label.trim() : String(opt.label ?? '')
                const value = typeof opt.value === 'string' ? opt.value.trim() : String(opt.value ?? label)
                if (!label && !value) return null
                return { label, value }
              })
              .filter(Boolean)
            return normalized.length > 0 ? JSON.stringify(normalized) : null
          }
          return null
        })()
      : null

    const payload: {
      taskFieldId?: number
      name: string
      type: string
      label: string
      isRequired: boolean
      isHidden: boolean
      options: string | null
      sort: number
    } = {
      ...(typeof field.remoteId === 'number' ? { taskFieldId: field.remoteId } : {}),
      name: field.name,
      type: mappedType,
      label: field.name,
      isRequired: !!field.required,
      isHidden: false,
      options: optionsStr,
      sort,
    }
    try {
      await taskTypeService.updateTemplateField(payload)
    } catch {}
  }

  const handleRemoveFieldRemote = async (field: Template['fields'][number]) => {
    if (!field.remoteId || !numericTaskTypeId) {
      console.warn('[TemplateDetailPage.handleRemoveFieldRemote] 缺少远端ID或任务类型ID，跳过后端删除')
      return
    }
    try {
      console.log('[TemplateDetailPage.handleRemoveFieldRemote] 删除远端字段 remoteId:', field.remoteId)
      // 1. 调用删除接口
      const msg = await taskTypeService.deleteTemplateField(field.remoteId)
      
      // 2. 删除成功后，调用列表接口刷新自定义字段列表
      const updatedFields = await taskTypeService.getTemplateFields(numericTaskTypeId)
      
      // 3. 更新本地模板字段
      if (templateIdKey && updatedFields) {
        updateTemplate(templateIdKey, {
          name: currentTemplate?.name || '',
          type: currentTemplate?.type || 'task',
          description: currentTemplate?.description || '',
          fields: updatedFields,
        })
        
        // 4. 更新当前模板状态
        setCurrentTemplate(prev => prev ? {
          ...prev,
          fields: updatedFields,
        } : null)
      }
      return msg
    } catch (error) {
      console.error('[TemplateDetailPage.handleRemoveFieldRemote] 删除字段或刷新列表失败:', error)
      throw error
    }
  }

  const handleCancel = () => {
    navigate({ to: '/templates/management' })
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen px-4 py-6">
        <Card className="p-6 h-full">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            <span className="ml-2">{t('templatesManagement.detail.loading')}</span>
          </div>
        </Card>
      </div>
    )
  }

  // 失败提示非阻塞：在卡片内显示提示，但允许继续编辑模板

  if (!currentTemplate) {
    return (
      <div className="w-full min-h-screen px-4 py-6">
        <Card className="p-6 h-full">
          <div className="text-muted-foreground">{t('templatesManagement.detail.notFound')}</div>
          <div className="mt-4">
            <Button variant="outline" onClick={handleCancel}>{t('templatesManagement.detail.back')}</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen px-4 py-6">
      <Card className="h-full">
        <CardContent className="h-full">
          <TemplateForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            initialData={{
              ...currentTemplate,
            }}
            fieldsOnly
            onAddFieldRemote={handleAddFieldRemote}
            onRemoveFieldRemote={handleRemoveFieldRemote}
            onEditFieldRemote={handleEditFieldRemote}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// 依赖组件导入（避免循环引用错误）
import { TemplateForm } from './TemplateForm'
