import { z } from 'zod'
import { useEffect, useMemo, useState } from 'react'
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
import { SelectDropdown } from '@/components/select-dropdown'
import { useTranslation } from 'react-i18next'
import type { Project, ProjectMember } from '../types'
import { projectsService } from '../services/projects.service'
import '@/features/projects/i18n/register'

const schema = z.object({
  projectName: z.string().min(2, '项目名称至少2个字符').max(64, '项目名称最多64个字符'),
  description: z.string().max(280, '描述最多280字符').optional().or(z.literal('')),
  assigneeId: z.string().min(1, '请选择子项目负责人'),
  assigneeName: z.string().optional(),
})

export type SubprojectFormValues = z.infer<typeof schema>

export function SubprojectForm(props: {
  parent: Project
  submitting?: boolean
  onSubmit: (values: SubprojectFormValues) => Promise<void> | void
}) {
  const { parent, submitting = false, onSubmit } = props
  const { t } = useTranslation()
  const form = useForm<SubprojectFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      projectName: '',
      description: '',
      assigneeId: '',
      assigneeName: '',
    },
  })

  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  useEffect(() => {
    let alive = true
    setLoadingMembers(true)
    projectsService
      .listMembers(parent.id)
      .then((list) => {
        if (!alive) return
        setMembers(list)
      })
      .catch(() => {
        // 无需抛错，保持空列表
      })
      .finally(() => {
        if (alive) setLoadingMembers(false)
      })
    return () => {
      alive = false
    }
  }, [parent.id])

  const assigneeItems = useMemo(
    () =>
      members.map((m) => ({
        label: m.name || m.userId,
        value: m.userId,
      })),
    [members],
  )

  const handleSubmit = async (values: SubprojectFormValues) => {
    try {
      await onSubmit(values)
    } catch (e: unknown) {
      const error = e as { message?: string }
      if (error?.message) {
        form.setError('projectName', { type: 'server', message: error.message })
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormItem>
          <FormLabel>{t('projects.sub.parent', { defaultValue: '父项目' })}</FormLabel>
          <FormControl>
            <Input value={`${parent.name}（ID: ${parent.id}）`} disabled />
          </FormControl>
        </FormItem>

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

        {/* 子项目创建不再显示“可见/不可见”选择 */}

        <FormField
          control={form.control}
          name='assigneeId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('projects.sub.assignee', { defaultValue: '子项目负责人' })}</FormLabel>
              <FormControl>
                <SelectDropdown
                  isControlled
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                    const m = members.find((mm) => mm.userId === val)
                    form.setValue('assigneeName', m?.name || val, { shouldValidate: false, shouldDirty: false })
                  }}
                  isPending={loadingMembers}
                  items={assigneeItems}
                  placeholder={t('projects.sub.assigneePlaceholder', { defaultValue: '选择负责人' })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2'>
          <Button type='submit' disabled={submitting}>
            {t('projects.sub.create', { defaultValue: '创建子项目' })}
          </Button>
        </div>
      </form>
    </Form>
  )
}
