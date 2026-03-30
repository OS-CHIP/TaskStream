import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { projectsService } from '../services/projects.service'

// 增强的表单验证模式
const enhancedSchema = z.object({
  projectName: z
    .string()
    .min(2, '项目名称至少需要2个字符')
    .max(64, '项目名称不能超过64个字符')
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5\s\-_]+$/, '项目名称只能包含字母、数字、中文、空格、横线和下划线'),
  description: z
    .string()
    .max(280, '项目描述不能超过280个字符')
    .optional()
    .or(z.literal('')),
})

export type EnhancedProjectFormValues = z.infer<typeof enhancedSchema>

interface EnhancedProjectFormProps {
  defaultValues?: Partial<EnhancedProjectFormValues>
  mode?: 'create' | 'edit'
  onSubmit: (values: EnhancedProjectFormValues) => Promise<void> | void
  onCancel?: () => void
}

export function EnhancedProjectForm({
  defaultValues,
  mode = 'create',
  onSubmit,
  onCancel,
}: EnhancedProjectFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const form = useForm<EnhancedProjectFormValues>({
    resolver: zodResolver(enhancedSchema),
    defaultValues: {
      projectName: '',
      description: '',
      ...defaultValues,
    },
  })

  const handleSubmit = async (values: EnhancedProjectFormValues) => {
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    try {
      // 额外的业务验证
      await validateBusinessRules(values)
      
      // 调用提交处理函数
      await onSubmit(values)
      
      setSubmitSuccess(true)
      toast.success(mode === 'create' ? '项目创建成功！' : '项目更新成功！')
      
      // 重置表单（仅在创建模式下）
      if (mode === 'create') {
        form.reset()
      }
    } catch (error: unknown) {
      const err = error as { message?: string; field?: string }
      const errorMessage = err?.message || '操作失败，请稍后重试'
      setSubmitError(errorMessage)
      toast.error(errorMessage)
      
      // 如果是字段级别的错误，设置到对应字段
      if (err?.field && err.field in form.getValues()) {
        form.setError(err.field as keyof EnhancedProjectFormValues, { type: 'server', message: errorMessage })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 业务规则验证
  const validateBusinessRules = async (values: EnhancedProjectFormValues) => {
    // 检查项目名称是否已存在（模拟）
    if (mode === 'create') {
      const existingProjects = await projectsService.list({ q: values.projectName })
      const nameExists = existingProjects.items.some(
        project => project.name.toLowerCase() === values.projectName.toLowerCase()
      )
      
      if (nameExists) {
        throw { field: 'projectName', message: '项目名称已存在，请使用其他名称' }
      }
    }
    
    // 其他业务规则验证...
  }

  const watchedProjectName = form.watch('projectName')

  return (
    <div className="space-y-6">
      {/* 成功提示 */}
      {submitSuccess && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {mode === 'create' ? '项目创建成功！' : '项目更新成功！'}
          </AlertDescription>
        </Alert>
      )}

      {/* 错误提示 */}
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* 项目名称 */}
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  项目名称 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="请输入项目名称"
                    {...field}
                    className="transition-colors focus:border-blue-500"
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  项目名称将用于标识您的项目，支持中文、英文、数字等字符
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 项目描述 */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">项目描述</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="请输入项目描述（可选）"
                    className="min-h-[80px] resize-none transition-colors focus:border-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-xs text-gray-500">
                  简要描述项目的目标和内容，最多280个字符
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 状态选择已取消，默认按“可见”提交 */}

          {/* 项目预览信息 */}
          {watchedProjectName && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium text-gray-700 mb-2">项目预览</h4>
              <div className="space-y-1 text-xs text-gray-600">
                <div>名称: {watchedProjectName}</div>
                <div>创建时间: {new Date().toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                取消
              </Button>
            )}
            <Button
              type="submit"
              disabled={submitting}
              className="min-w-[100px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === 'create' ? '创建中...' : '保存中...'}
                </>
              ) : (
                mode === 'create' ? '创建项目' : '保存更改'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
