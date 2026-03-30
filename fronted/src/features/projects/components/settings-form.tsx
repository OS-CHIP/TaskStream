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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Visibility } from '../types'

const schema = z.object({
  name: z.string().min(2, '名称至少2个字符').max(64, '名称最多64个字符'),
  description: z.string().max(280, '描述最多280字符').optional().or(z.literal('')),
  visibility: z.enum(['private', 'internal', 'public']),
})

export type SettingsFormValues = z.infer<typeof schema>

export function SettingsForm(props: {
  defaultValues: SettingsFormValues
  submitting?: boolean
  onSubmit: (values: SettingsFormValues) => Promise<void> | void
}) {
  const { defaultValues, submitting = false, onSubmit } = props
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues.name ?? '',
      description: defaultValues.description ?? '',
      visibility: (defaultValues.visibility as Visibility) ?? 'private',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>名称</FormLabel>
              <FormControl>
                <Input placeholder='请输入项目名称' {...field} />
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
              <FormLabel>描述</FormLabel>
              <FormControl>
                <Textarea placeholder='可选：项目简介' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='visibility'
          render={({ field }) => (
            <FormItem>
              <FormLabel>可见性</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder='选择可见性' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='private'>私有</SelectItem>
                    <SelectItem value='internal'>内部</SelectItem>
                    <SelectItem value='public'>公开</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2'>
          <Button type='submit' disabled={submitting}>
            {submitting ? '保存中…' : '保存设置'}
          </Button>
        </div>
      </form>
    </Form>
  )
}