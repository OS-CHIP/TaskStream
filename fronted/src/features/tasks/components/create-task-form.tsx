import { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { createTaskSchema, type CreateTaskFormData } from '../data/schema'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { MarkdownEditorField } from './markdown-editor'
import { FileUpload, type UploadedFile } from './file-upload'
import { Percent } from 'lucide-react'
import { FillProgressDialog } from './fill-progress-dialog'
import { TaskService } from '../services/task-service'
import { taskTypeService } from '@/features/templates/services/task-type-service'
import { getTaskDetail } from '../services/task-detail-service'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { useProjectSwitcher } from '@/components/layout/project-switcher'
import { ParentTaskSelector } from './parent-task-selector'
import { TagInput } from '@/components/ui/tag-input'
import type { TaskMention } from '@/types/mention'
import { FieldRenderer } from '@/features/templates/components/FieldRenderer'
import type { TemplateField } from '@/types/templates'
import { Separator } from '@/components/ui/separator'
import { MultiSelect } from '@/components/ui/multi-select'
import '../i18n/register'


interface CreateTaskFormProps {
  editId?: string
  onSubmit?: (data: CreateTaskFormData) => void
  onCancel?: () => void
  initialValues?: Partial<CreateTaskFormData>
}

export function CreateTaskForm({ editId, onSubmit, onCancel, initialValues }: CreateTaskFormProps) {
  const { t } = useTranslation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attachments, setAttachments] = useState<UploadedFile[]>([])
  const [progressDialogOpen, setProgressDialogOpen] = useState(false)
  
  // 包装 setAttachments 以支持函数式更新
  const handleAttachmentsChange = (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => {
    console.log('📝 CreateTaskForm - handleAttachmentsChange 被调用:', typeof files === 'function' ? 'function' : files)
    if (typeof files === 'function') {
      setAttachments(prevAttachments => {
        console.log('📝 CreateTaskForm - 函数式更新前:', prevAttachments)
        const newAttachments = files(prevAttachments)
        console.log('📝 CreateTaskForm - 函数式更新后:', newAttachments)
        return newAttachments
      })
    } else {
      console.log('📝 CreateTaskForm - 直接设置 attachments:', files)
      setAttachments(files)
    }
  }
  
  const [taskOptions, setTaskOptions] = useState<{
    types: { label: string; value: string }[]
    priorities: { label: string; value: string }[]
    assignees: { label: string; value: number }[]
    projectPhases: { label: string; value: string }[]
    parentTasks: { label: string; value: string }[]
  } | null>(null)
  const [isLoadingOptions, setIsLoadingOptions] = useState(true)
  const [isLoadingTask, setIsLoadingTask] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [customFields, setCustomFields] = useState<TemplateField[]>([])
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, unknown>>({})
  const originalAssigneeRef = useRef<number | undefined>(undefined)
  const defaultsAppliedRef = useRef(false)
  
  // 获取当前选中的项目ID
  const { currentProject } = useProjectSwitcher()
  
  // 获取当前项目ID用于@任务功能
  const currentProjectId = useMemo(() => {
    return localStorage.getItem('selected_project_id')
  }, [])
  
  // 处理@任务选择
  const handleMentionSelect = (task: TaskMention) => {
    toast.success(`已插入任务链接: ${task.title}`)
  }
  
  const form = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      type: '',
      title: '',
      description: '',
      priority: undefined,
      assignee: undefined,
      assigner: undefined,
      observers: '',
      startTime: undefined,
      dueDate: undefined,
      parentTask: [],

      estimatedHours: undefined,
      completionPercentage: 0,
    },
  })

  useEffect(() => {
    if (editId) return
    if (!initialValues) return
    const run = async () => {
      while (isLoadingOptions || !taskOptions) {
        await new Promise((r) => setTimeout(r, 50))
      }
      const normalizeNumber = (v: unknown): number | undefined => {
        if (v == null) return undefined
        const n = typeof v === 'string' ? parseInt(v, 10) : Number(v)
        return isNaN(n) ? undefined : n
      }
      const normalizePriority = (v: unknown): 'low' | 'medium' | 'high' | undefined => {
        if (v === 'low' || v === 'medium' || v === 'high') return v
        return undefined
      }
      const nextValues: Partial<CreateTaskFormData> = {
        type: initialValues.type ?? '',
        assignee: normalizeNumber(initialValues.assignee),
        assigner: normalizeNumber(initialValues.assigner),
        priority: normalizePriority(initialValues.priority),
        estimatedHours: normalizeNumber(initialValues.estimatedHours),
        parentTask: Array.isArray(initialValues.parentTask)
          ? initialValues.parentTask.map((p: any) =>
              typeof p === 'object' && p?.id ? String(p.id) : String(p)
            )
          : [],
      }
      form.reset({
        ...form.getValues(),
        ...nextValues,
      } as any)
      
      if (initialValues.type) {
        try {
          const fields = await taskTypeService.getTemplateFields(Number(initialValues.type || 14))
          setCustomFields(fields)
          setCustomFieldValues({})
          console.log('创建副本时获取任务类型自定义字段:', fields)
        } catch (_e) {
          console.log('创建副本时获取自定义字段失败')
        }
      }
    }
    run()
  }, [initialValues, editId, isLoadingOptions, taskOptions])

  // 获取任务选项数据
  const lastProjectIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    const effectiveId = currentProject?.id || localStorage.getItem('selected_project_id') || undefined
    // 若项目ID未变化，跳过加载，避免重复请求（React严格模式下首次渲染的双调用）
    if (lastProjectIdRef.current === effectiveId) {
      return
    }
    lastProjectIdRef.current = effectiveId

    const loadTaskOptions = async () => {
      try {
        setIsLoadingOptions(true)
        const options = await TaskService.getTaskOptions(effectiveId)
        setTaskOptions(options)
      } catch (_error) {
        // console.error('加载任务选项失败:', _error)
        toast.error('加载任务选项失败，请刷新页面重试')
      } finally {
        setIsLoadingOptions(false)
      }
    }

    loadTaskOptions()
  }, [currentProject?.id])

  useEffect(() => {
    if (isEditMode) return
    if (!taskOptions || defaultsAppliedRef.current) return
    const pv = form.getValues('priority')
    const av = form.getValues('assignee')
    const sv = form.getValues('assigner')
    const nextPriority = taskOptions.priorities?.[0]?.value
    const nextAssignee = taskOptions.assignees?.[0]?.value
    const nextAssigner = taskOptions.assignees?.[0]?.value
    const updates: Partial<CreateTaskFormData> = {}
    if (!pv && nextPriority) updates.priority = nextPriority as any
    if (!av && nextAssignee != null) updates.assignee = Number(nextAssignee)
    if (!sv && nextAssigner != null) updates.assigner = Number(nextAssigner)
    if (Object.keys(updates).length > 0) {
      form.reset({ ...form.getValues(), ...updates } as any)
      defaultsAppliedRef.current = true
    }
  }, [isEditMode, taskOptions])
  // 加载任务详情数据（编辑模式）
  useEffect(() => {
    const loadTaskDetail = async () => {
      if (!editId) {
        setIsEditMode(false)
        return
      }

      try {
        setIsLoadingTask(true)
        setIsEditMode(true)
        
        // 等待任务选项数据加载完成
        while (isLoadingOptions || !taskOptions) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        const taskDetail = await getTaskDetail(editId)
        
        console.log('API返回的原始任务数据:', taskDetail)
        console.log('任务选项数据:', taskOptions)
        
        // 处理 assignee 字段，直接使用 API 返回的 assignee 值
        let assigneeValue: number | undefined
        const assigneeField = (taskDetail as any).assignee
        if (assigneeField && typeof assigneeField === 'object' && assigneeField.id) {
          const idValue = assigneeField.id
          assigneeValue = typeof idValue === 'string' ? parseInt(idValue, 10) : Number(idValue)
          if (isNaN(assigneeValue)) {
            assigneeValue = undefined
          }
        } else if (typeof assigneeField === 'number') {
          assigneeValue = assigneeField
        } else if (typeof assigneeField === 'string') {
          const numValue = parseInt(assigneeField, 10)
          assigneeValue = isNaN(numValue) ? undefined : numValue
        } else {
          assigneeValue = undefined
        }
        
        console.log('Owner字段处理:', {
          originalOwner: taskDetail.owner,
          originalAssignee: taskDetail.assignee,
          finalAssigneeValue: assigneeValue,
          assigneeValueType: typeof assigneeValue
        })
        originalAssigneeRef.current = assigneeValue

        let assignerValue: number | undefined
        const assignerField = (taskDetail as any).assigner
        if (assignerField && typeof assignerField === 'object' && (assignerField as any).id) {
          const idValue = (assignerField as any).id
          assignerValue = typeof idValue === 'string' ? parseInt(idValue, 10) : Number(idValue)
          if (isNaN(assignerValue)) {
            assignerValue = undefined
          }
        } else if (typeof assignerField === 'number') {
          assignerValue = assignerField
        } else if (typeof assignerField === 'string') {
          const numValue = parseInt(assignerField, 10)
          assignerValue = isNaN(numValue) ? undefined : numValue
        } else {
          assignerValue = undefined
        }
        
        // 处理priority字段，确保表单接收的是字符串类型（匹配schema）
        let priorityValue: 'low' | 'medium' | 'high' = 'medium'
        if (typeof taskDetail.priority === 'string') {
          // 确保优先级值是有效的枚举值
          if (taskDetail.priority === 'low' || taskDetail.priority === 'medium' || taskDetail.priority === 'high') {
            priorityValue = taskDetail.priority
          }
        }
        
        const formData = {
          type: taskDetail.type || '',
          title: taskDetail.title,
          description: taskDetail.description || '',
          priority: priorityValue,
          assignee: assigneeValue,
          assigner: assignerValue,
          startTime: taskDetail.startTime,
          dueDate: taskDetail.dueDate,
          parentTask: taskDetail.parentTask || [],
          estimatedHours: taskDetail.estimatedHours,
          completionPercentage: (taskDetail as any).completionPercentage ?? 0,
          tags: Array.isArray(taskDetail.tags) ? taskDetail.tags.join(',') : (taskDetail.tags || ''), // 处理标签字段的类型转换
        }
        
        console.log('准备回填的表单数据:', formData)
        console.log('优先级字段值:', formData.priority)
        console.log('优先级字段类型:', typeof formData.priority)
        console.log('负责人字段值:', formData.assignee)
        console.log('负责人字段类型:', typeof formData.assignee)
        console.log('可用的负责人选项:', taskOptions?.assignees)
        
        // 按模板字段渲染并回填值（编辑模式优先从模板获取字段定义）
        try {
          const taskTypeIdForTemplate = Number(taskDetail.type || 0)
          const tmplFields = await taskTypeService.getTemplateFields(taskTypeIdForTemplate)
          setCustomFields(tmplFields)
          const dynamicRaw = (taskDetail as any).dynamicFields
          const values: Record<string, unknown> = {}
          let parsed: any = null
          if (dynamicRaw) {
            try {
              parsed = typeof dynamicRaw === 'string' ? JSON.parse(dynamicRaw) : dynamicRaw
            } catch {}
          }
          if (parsed && typeof parsed === 'object') {
            tmplFields.forEach((f) => {
              const matchedKey = Object.keys(parsed).find((k) => {
                const item = parsed[k]
                const label = String(item?.label || k)
                return label === f.name || k === f.name || label === f.id || k === f.id
              })
              if (!matchedKey) return
              const item = parsed[matchedKey]
              const val = item?.value ?? ''
              if (f.type === 'date' && typeof val === 'string' && val) {
                values[f.id] = new Date(val.replace(/-/g, '/'))
              } else if (f.type === 'number') {
                values[f.id] = typeof val === 'number' ? val : Number(val || 0)
              } else {
                values[f.id] = val
              }
            })
          }
          setCustomFieldValues(values)
        } catch {}

        // 处理附件数据回显
        if (taskDetail.attachments && taskDetail.attachments.length > 0) {
          const existingAttachments: UploadedFile[] = taskDetail.attachments.map(att => ({
            id: att.id,
            name: att.name,
            size: att.size,
            type: att.type,
            url: att.url,
            file: undefined, // 已上传的文件不需要File对象
            status: 'success' as const,
            progress: 100, // 已上传完成
            error: undefined,
            uploadedAt: att.uploadedAt,
            linkedToTask: true // 标记为已关联到任务的附件
          }))
          
          console.log('回显附件数据:', existingAttachments)
          handleAttachmentsChange(existingAttachments)
        } else {
          // 如果没有附件，清空附件列表
          handleAttachmentsChange([])
        }
        
        // 确保选项数据已加载后再回填
        if (taskOptions) {
          // 验证负责人值是否在选项中存在，确保类型转换的一致性
          const assigneeExists = formData.assignee !== undefined && taskOptions.assignees?.some(option => {
            // 将选项值和表单值都转换为数字进行比较
            const optionValue = typeof option.value === 'string' ? parseInt(option.value, 10) : Number(option.value)
            const formValue = Number(formData.assignee)
            return !isNaN(optionValue) && !isNaN(formValue) && optionValue === formValue
          })
          
          console.log('负责人值验证:', {
            formDataAssignee: formData.assignee,
            formDataAssigneeType: typeof formData.assignee,
            assigneeExists,
            availableAssignees: taskOptions.assignees?.map(a => ({ 
              label: a.label, 
              value: a.value, 
              valueType: typeof a.value,
              numericValue: Number(a.value)
            }))
          })
          
          // 验证分配人值是否在选项中存在
          const assignerExists = formData.assigner !== undefined && taskOptions.assignees?.some(option => {
            const optionValue = typeof option.value === 'string' ? parseInt(option.value, 10) : Number(option.value)
            const formValue = Number(formData.assigner)
            return !isNaN(optionValue) && !isNaN(formValue) && optionValue === formValue
          })
          if (!assignerExists && formData.assigner !== undefined) {
            console.warn('分配人值不在可用选项中，保留原值:', formData.assigner)
          }

          // 如果负责人值不在可用选项中，保留原始值以通过校验并正常提交
          if (!assigneeExists && formData.assignee !== undefined) {
            console.warn('负责人值不在可用选项中，保留原值:', formData.assignee)
          }
          
          // 使用 setTimeout 确保组件完全渲染后再回填
          setTimeout(() => {
            form.reset(formData)
            console.log('表单回填完成，当前表单值:', form.getValues())
            
            // 再次验证回填结果
            const currentAssignee = form.getValues('assignee')
            console.log('回填后的负责人值:', currentAssignee)
          }, 100)
        }
      } catch (_error) {
        console.error('加载任务详情失败:', _error)
        toast.error('加载任务详情失败，请重试')
      } finally {
        setIsLoadingTask(false)
      }
    }

    loadTaskDetail()
  }, [editId, form, isLoadingOptions, taskOptions])

  const handleSubmit = async (data: CreateTaskFormData) => {
    console.log('🚀 handleSubmit called', { isEditMode, data });

    try {
      // 检查负责人是否为当前用户（仅在创建模式下）
      if (!isEditMode) {
        try {
          let userInfo: any = null
          const userInfoStr = localStorage.getItem('user_info_cache')
          console.log('📦 localStorage user_info_cache:', userInfoStr);
          
          if (userInfoStr) {
            userInfo = JSON.parse(userInfoStr)
          } else {
            console.warn('⚠️ user_info_cache is missing in localStorage, trying to fetch from store...');
            // 尝试从 store 获取
            userInfo = useAuthStore.getState().auth.userInfo
            
            if (!userInfo) {
               console.error('❌ Could not get user info from localStorage or store')
               toast.error('无法获取用户信息，请重新登录')
               return // 终止提交
            }
          }

          if (!userInfo) {
             console.error('❌ Could not get user info from any source')
             toast.error('无法获取当前用户信息，请重新登录')
             setIsSubmitting(false)
             return
          }

          if (userInfo) {
            console.log('🔍 Debugging User Check:', {
              formAssignee: data.assignee,
              currentUserId: userInfo.id,
              isMatch: Number(data.assignee) === Number(userInfo.id)
            })

            
          }
        } catch (e) {
          console.error('检查用户身份时出错:', e)
        }
      }

      // eslint-disable-next-line no-console
      console.log(isEditMode ? '更新任务提交数据:' : '创建任务提交数据:', data)
      // eslint-disable-next-line no-console
      console.log('标签字段值:', data.tags, '类型:', typeof data.tags)
      setIsSubmitting(true)
      
      // 客户端验证
      const validation = TaskService.validateTaskData(data)
      if (!validation.isValid) {
        validation.errors.forEach(error => {
          toast.error(error)
        })
        return
      }

      // 提取成功上传的文件ID
      const successfulAttachments = attachments.filter(file => file.status === 'success' && file.id)
      const attachmentIds = successfulAttachments.length > 0 
        ? successfulAttachments.map(file => {
            // 直接使用后端返回的ID，转换为字符串
            return String(file.id)
          }).join(',')
        : undefined

      const customFieldsPayload = (customFields || []).reduce((acc, f) => {
        const v = customFieldValues[f.id]
        let serialized: unknown = v
        if (v instanceof Date) {
          const d = new Date(v)
          const y = d.getFullYear()
          const m = String(d.getMonth() + 1).padStart(2, '0')
          const day = String(d.getDate()).padStart(2, '0')
          const hh = String(d.getHours()).padStart(2, '0')
          const mm = String(d.getMinutes()).padStart(2, '0')
          const ss = String(d.getSeconds()).padStart(2, '0')
          serialized = `${y}-${m}-${day} ${hh}:${mm}:${ss}`
        }
        return { ...acc, [f.name]: serialized }
      }, {} as Record<string, unknown>)

      // 构造任务数据（包含附件）
      const taskDataWithAttachments = {
        ...data,
        projectId: currentProject?.id, // 添加项目ID
        attachments: attachments
          .filter(file => file.status === 'success' && file.url) // 只包含成功上传的文件
          .map(file => file.url!), // 提取文件URL
        assignee: data.assignee, // assignee 现在已经是 number 类型
        customFields: customFieldsPayload,
        ...(attachmentIds && { attachmentIds }) // 只有当有附件ID时才添加此参数
      }

      if (isEditMode && editId) {
        // 更新任务
        await TaskService.updateTask(editId, taskDataWithAttachments)
        // 单独更新进度
        if (typeof data.completionPercentage === 'number') {
          await TaskService.updateTaskCompletion(editId, data.completionPercentage)
        }
        toast.success('任务更新成功！')
      } else {
        // 创建任务
        await TaskService.createTask(taskDataWithAttachments)

        toast.success('任务创建成功！')
      }
      
      // 重置表单（仅在创建模式下），但保留附件上传历史
      if (!isEditMode) {
        form.reset()
        // 将已上传的文件标记为"已关联到任务"，但保持显示
        setAttachments(prev => 
          prev.map(file => 
            file.status === 'success' 
              ? { ...file, status: 'success' as const, linkedToTask: true }
              : file
          )
        )
      }
      
      // 调用父组件的回调
      onSubmit?.(data)
      
    } catch (_error) {
      let errorMessage = isEditMode ? '更新任务失败，请重试' : '创建任务失败，请重试'
      const anyErr = _error as any
      if (anyErr && typeof anyErr === 'object') {
        const serverMsg = anyErr.msg || anyErr.message
        const serverData = anyErr.data
        const serverDesc = (serverData && typeof serverData.description === 'string' ? serverData.description : undefined) || anyErr.description
        if (typeof serverDesc === 'string' && serverDesc.trim()) {
          errorMessage = serverDesc
        } else if (serverMsg && typeof serverMsg === 'string') {
          errorMessage = serverMsg
        }
        if (serverData && typeof serverData === 'object') {
          Object.entries(serverData).forEach(([key, msg]) => {
            if (typeof msg === 'string') {
              try {
                form.setError(key as keyof CreateTaskFormData, { type: 'server', message: msg })
              } catch {}
            }
          })
        } else if (anyErr.response?.data) {
          const respData = anyErr.response.data
          const respDesc = respData?.description
          const respMsg = respData?.msg || respData?.message
          if (typeof respDesc === 'string' && respDesc.trim()) {
            errorMessage = respDesc
          } else if (respMsg && typeof respMsg === 'string') {
            errorMessage = respMsg
          }
          const details = respData?.data
          if (details && typeof details === 'object') {
            Object.entries(details).forEach(([key, msg]) => {
              if (typeof msg === 'string') {
                try {
                  form.setError(key as keyof CreateTaskFormData, { type: 'server', message: msg })
                } catch {}
              }
            })
          }
          const errorsPayload = respData?.errors
          if (errorsPayload) {
            if (Array.isArray(errorsPayload)) {
              errorsPayload.forEach((e: any) => {
                const key = e?.field || e?.name
                const msg = e?.message || e?.msg
                if (key && typeof msg === 'string') {
                  try {
                    form.setError(key as keyof CreateTaskFormData, { type: 'server', message: msg })
                  } catch {}
                }
              })
            } else if (typeof errorsPayload === 'object') {
              Object.entries(errorsPayload).forEach(([key, msg]) => {
                if (typeof msg === 'string') {
                  try {
                    form.setError(key as keyof CreateTaskFormData, { type: 'server', message: msg })
                  } catch {}
                }
              })
            }
          }
        }
      }
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 如果正在加载任务详情，显示加载状态
  if (isLoadingTask) {
    return (
      <div className="create-task-container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载任务详情中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="create-task-container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
          {isEditMode ? t('tasks.edit.title', '编辑任务') : t('tasks.create.title', '创建任务')}
        </h1>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="create-task-form space-y-4 sm:space-y-6">
          {/* 任务类型和标签 - 左右布局 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {/* 任务类型 - 必填 */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => {
                console.log('任务类型字段渲染 - field.value:', field.value, 'type:', typeof field.value)
                console.log('任务类型选项:', taskOptions?.types)
                
                // 检查当前值是否在选项中存在
                const currentValueExists = taskOptions?.types?.some(option => 
                  option.value === field.value
                )
                console.log('当前任务类型值是否在选项中存在:', currentValueExists, '当前值:', field.value)
                
                return (
                  <FormItem>
                    <FormLabel>{t('tasks.create.taskType')} *</FormLabel>
  <SelectDropdown
    value={field.value}
    onValueChange={async (v) => { if (isEditMode) { return } console.log('任务类型变更:', v); field.onChange(v); try { const fields = await taskTypeService.getTemplateFields(Number(v || 14)); setCustomFields(fields); setCustomFieldValues({}); console.log('任务类型自定义字段:', fields); } catch (_e) { console.log('获取自定义字段失败'); } }}
    placeholder={isLoadingOptions ? '加载中...' : (isEditMode ? '编辑模式不可修改' : t('tasks.create.form.selectType', '请选择任务类型'))}
    items={taskOptions?.types.map(option => ({
      label: option.label,
      value: option.value
    })) || []}
    disabled={isLoadingOptions || isEditMode}
    isControlled={true}
  />
                    <FormMessage />
                  </FormItem>
                )
              }}
            />

            {/* 任务标签 - 可选 */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => {
                // 将逗号分隔的字符串转换为数组
                const tagsArray = field.value ? field.value.split(',').filter(tag => tag.trim()) : []
                
                return (
                  <FormItem>
                    <FormLabel>{t('tasks.create.tags')} *</FormLabel>
                    <FormControl>
                      <TagInput
                        value={tagsArray}
                        onChange={(tags) => {
                          // 将数组转换为逗号分隔的字符串
                          field.onChange(tags.join(','))
                        }}
                        placeholder={t('tasks.create.tagsPlaceholder')}
                        disabled={isSubmitting}
                        fetchSuggestions={TaskService.getTags}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          {/* 任务名称 - 必填 */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tasks.create.taskName')} *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder={t('tasks.create.taskNamePlaceholder')} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 任务描述 - 使用增强的Markdown编辑器，支持@任务关联 */}
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t('tasks.create.description')}</FormLabel>
                <FormControl>
                  <MarkdownEditorField
                    field={field}
                    fieldState={fieldState}
                    label={t('tasks.create.description')}
                    placeholder={t('tasks.create.descriptionPlaceholder')}
                    required={false}
                    projectId={currentProjectId || undefined}
                    onMentionSelect={handleMentionSelect}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage>{fieldState.error.message}</FormMessage>
                )}
              </FormItem>
            )}
          />

          

          

          {/* 双列布局：优先级 */}
          <div className="form-row-double grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {/* 优先级 - 必填 */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => {
                console.log('优先级字段渲染 - field.value:', field.value, 'type:', typeof field.value)
                console.log('优先级选项:', taskOptions?.priorities)
                
                // 检查当前值是否在选项中存在
                const currentValueExists = taskOptions?.priorities?.some(option => 
                  option.value === field.value
                )
                console.log('当前优先级值是否在选项中存在:', currentValueExists, '当前值:', field.value)
                
                return (
                  <FormItem>
                    <FormLabel>{t('tasks.create.priority')} *</FormLabel>
                    <SelectDropdown
                      value={field.value}
                      onValueChange={(value) => {
                        console.log('优先级选择变更:', value, 'type:', typeof value)
                        // 保持字符串类型，不进行数字转换
                        field.onChange(value)
                      }}
                      placeholder={isLoadingOptions ? t('common.loading') : t('tasks.create.selectPriority')}
                      items={taskOptions?.priorities.map(option => ({
                        label: t(`tasks.priority.${option.value}`, option.label),
                        value: option.value
                      })) || []}
                      disabled={isLoadingOptions}
                      isControlled={true}
                    />
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
          
          {/* 双列布局：负责人和分配人 */}
          <div className="form-row-double grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {/* 负责人 - 必填 */}
            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => {
                console.log('负责人字段渲染 - field.value:', field.value, 'type:', typeof field.value)
                console.log('负责人选项:', taskOptions?.assignees)
                
                // 检查当前值是否在选项中存在
                const currentValueExists = taskOptions?.assignees?.some(option => 
                  Number(option.value) === Number(field.value)
                )
                console.log('当前负责人值是否在选项中存在:', currentValueExists, '当前值:', field.value)
                
                return (
                  <FormItem>
                    <FormLabel>{t('tasks.create.assignee')} *</FormLabel>
                    <SelectDropdown
                      value={field.value}
                      onValueChange={(value) => {
                        console.log('负责人选择变更:', value, 'type:', typeof value)
                        // 将字符串值转换为数字
                        field.onChange(value ? Number(value) : undefined)
                      }}
                      placeholder={isLoadingOptions ? '加载中...' : t('tasks.create.assigneePlaceholder')}
                      items={taskOptions?.assignees || []}
                      disabled={isLoadingOptions}
                      isControlled={true}
                    />
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
            
            {/* 分配人 - 必填 */}
            <FormField
              control={form.control}
              name="assigner"
              render={({ field }) => {
                console.log('分配人字段渲染 - field.value:', field.value, 'type:', typeof field.value)
                console.log('分配人选项:', taskOptions?.assignees)
                
                // 检查当前值是否在选项中存在
                const currentValueExists = taskOptions?.assignees?.some(option => 
                  Number(option.value) === Number(field.value)
                )
                console.log('当前分配人值是否在选项中存在:', currentValueExists, '当前值:', field.value)
                
                return (
                  <FormItem>
                    <FormLabel>{t('tasks.create.assigner')} *</FormLabel>
                    <SelectDropdown
                      value={field.value}
                      onValueChange={(value) => {
                        console.log('分配人选择变更:', value, 'type:', typeof value)
                        // 将字符串值转换为数字
                        field.onChange(value ? Number(value) : undefined)
                      }}
                      placeholder={isLoadingOptions ? '加载中...' : t('tasks.create.assignerPlaceholder')}
                      items={taskOptions?.assignees || []}
                      disabled={isLoadingOptions}
                      isControlled={true}
                    />
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          <FormField
            control={form.control}
            name="observers"
            render={({ field }) => {
              const selected = field.value ? field.value.split(',').filter(Boolean) : []
              const options = (taskOptions?.assignees || []).map(opt => ({
                label: opt.label,
                value: String(opt.value),
              }))
              return (
                <FormItem>
                  <FormLabel>{t('tasks.create.observers')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={options}
                      selected={selected}
                      onChange={(vals) => {
                        field.onChange(vals.join(','))
                      }}
                      placeholder={isLoadingOptions ? t('common.loading') : t('tasks.create.observersPlaceholder', '请选择观察者（可多选）')}
                      disabled={isLoadingOptions}
                      triggerClassName="min-h-10"
                      maxVisible={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* 时间范围选择：开始时间和截止时间 */}
          <div className="space-y-4">
            <FormLabel className="text-base font-medium">{t('tasks.create.timeRange')}</FormLabel>
            
            {/* 开始时间 */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('tasks.create.startDate')} *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal user-input-display",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "yyyy-MM-dd")
                          ) : (
                            <span>{t('tasks.create.startDatePlaceholder')}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            // 设置为当天的开始时间 00:00:00
                            const newDate = new Date(date)
                            newDate.setHours(0, 0, 0, 0)
                            field.onChange(newDate)
                            // 如果选择的开始日期晚于当前截止日期，清空截止日期
                            const currentDueDate = form.getValues('dueDate')
                            if (currentDueDate && newDate > currentDueDate) {
                              form.setValue('dueDate', undefined)
                            }
                          }
                        }}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 截止时间 */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => {
                const startTime = form.watch('startTime')
                return (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t('tasks.create.dueDate')} *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "yyyy-MM-dd")
                            ) : (
                              <span>{t('tasks.create.dueDatePlaceholder')}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // 设置为当天的结束时间 23:59:59
                              const newDate = new Date(date)
                              newDate.setHours(23, 59, 59, 999)
                              field.onChange(newDate)
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date(new Date().setHours(0, 0, 0, 0))
                            // 如果有开始日期，截止日期不能早于开始日期
                            if (startTime) {
                              const startDate = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate())
                              return date < startDate
                            }
                            // 否则不能早于今天
                            return date < today
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>

          {/* 关联父任务 */}
          <FormField
            control={form.control}
            name="parentTask"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tasks.create.parentTask')}</FormLabel>
                <FormControl>
                  <ParentTaskSelector
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t('tasks.create.parentTaskPlaceholder')}
                    disabled={isLoadingOptions}
                    editTaskId={editId}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 预估工时 */}
          <FormField
            control={form.control}
            name="estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('tasks.create.estimatedHours')} *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    min="0"
                    step="1"
                    placeholder={t('tasks.create.estimatedHoursPlaceholder')}
                    onChange={(e) => {
                      const v = e.target.value
                      field.onChange(v ? parseInt(v, 10) : undefined)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 任务进度 */}
          {isEditMode && (
            <FormField
              control={form.control}
              name="completionPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.columns.progress', { defaultValue: '进度(%)' })}</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="0-100"
                        disabled
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setProgressDialogOpen(true)}
                      >
                        <Percent className="h-4 w-4 mr-2" />
                        {t('tasks.actions.fillProgress', { defaultValue: '填写进度' })}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {customFields && customFields.length > 0 && (
            <div className="space-y-4">
              <Separator className="mt-6 mb-4" />
              <FormLabel>{t('tasks.create.customFields')}</FormLabel>
              {customFields.map((f) => (
                <FieldRenderer
                  key={f.id}
                  field={f}
                  value={customFieldValues[f.id]}
                  onChange={(id, value) => {
                    setCustomFieldValues(prev => ({ ...prev, [id]: value }))
                  }}
                />
              ))}
            </div>
          )}

          {/* 附件上传 */}
          <div className="space-y-2">
            <FormLabel>{t('tasks.create.attachments')}</FormLabel>
            <FileUpload
              value={attachments}
              onChange={handleAttachmentsChange}
              maxFiles={5}
              maxSize={10}
              acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.md', '.zip', '.rar']}
            />
          </div>

          {/* 表单操作按钮 */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 sm:pt-8">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {t('tasks.create.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting 
                ? (isEditMode ? t('tasks.edit.updating', '更新中...') : t('tasks.create.creating'))
                : (isEditMode ? t('tasks.edit.updateTask', '更新任务') : t('tasks.create.createTask'))
              }
            </Button>
          </div>
        </form>
      </Form>

      {isEditMode && editId && (
        <FillProgressDialog
          open={progressDialogOpen}
          onOpenChange={setProgressDialogOpen}
          task={{ id: editId, completionPercentage: form.getValues().completionPercentage }}
          onSuccess={(newPercentage) => {
            form.setValue('completionPercentage', newPercentage, { shouldDirty: true })
          }}
        />
      )}
    </div>
  )
}
