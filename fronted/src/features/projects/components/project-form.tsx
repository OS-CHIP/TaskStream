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
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTranslation } from 'react-i18next'
import '@/features/projects/i18n/register'

const schema = z.object({
  projectName: z.string().min(2, '项目名称至少2个字符').max(64, '项目名称最多64个字符'),
  description: z.string().max(280, '描述最多280字符').optional().or(z.literal('')),
  status: z.enum(['1', '2']).default('1').optional(),
})

export type ProjectFormValues = z.infer<typeof schema>

export function ProjectForm(props: {
  defaultValues?: Partial<ProjectFormValues>
  mode?: 'create' | 'edit'
  submitting?: boolean
  onSubmit: (values: ProjectFormValues) => Promise<void> | void
}) {
  const { defaultValues, mode = 'create', submitting = false, onSubmit } = props
  const { t } = useTranslation()
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: '',
      description: '',
      status: '1',
      ...defaultValues,
    },
  })

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      await onSubmit({
        ...values,
        status: (values.status ?? '1') as '1' | '2',
      })
    } catch (e: unknown) {
      const error = e as { message?: string }
      if (error?.message) {
        form.setError('projectName' as keyof ProjectFormValues, { type: 'server', message: error.message })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='projectName'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projects.form.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('projects.form.placeholders.name')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projects.form.description')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('projects.form.placeholders.description')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 状态选择已取消，默认按“可见”提交 */}

        <div className='flex justify-end gap-2'>
          <Button type='submit' disabled={submitting}>
            {mode === 'create' ? t('projects.list.create') : t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
