import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { TaskService } from '../services/task-service'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useEffect } from 'react'

const formSchema = z.object({
  completionPercentage: z
    .number()
    .min(0, '不能小于0')
    .max(100, '不能大于100')
    .int('请输入整数')
})

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: { id: string; completionPercentage?: number }
  onSuccess?: (newPercentage: number) => void
}

export function FillProgressDialog({ open, onOpenChange, task, onSuccess }: Props) {
  const { t } = useTranslation()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      completionPercentage: Number(task?.completionPercentage ?? 0)
    }
  })

  useEffect(() => {
    if (open) {
      form.reset({
        completionPercentage: Number(task?.completionPercentage ?? 0)
      })
    }
  }, [open, task?.completionPercentage, form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!task) return
    try {
      const result = await TaskService.updateTaskCompletion(task.id, values.completionPercentage)
      if (!result.success) {
        throw new Error(result.message)
      }
      toast.success(t('common.save'))
      onOpenChange(false)
      onSuccess?.(values.completionPercentage)
    } catch (err) {
      toast.error((err as Error)?.message || t('common.error.unknown'))
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className='gap-2 sm:max-w-sm'>
        <DialogHeader className='text-left'>
          <DialogTitle>{t('tasks.actions.fillProgress') || '填写进度'}</DialogTitle>
          <DialogDescription>{t('tasks.columns.progress')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='completionPercentage'
              render={({ field }) => (
                <FormItem className='mb-2 space-y-1'>
                  <FormLabel>{t('tasks.columns.progress')}</FormLabel>
                  <FormControl>
                    <Input
                      type='number'
                      min={0}
                      max={100}
                      step={1}
                      className='h-8'
                      value={field.value}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className='gap-2'>
              <DialogClose asChild>
                <Button variant='outline' type='button'>{t('common.cancel')}</Button>
              </DialogClose>
              <Button type='submit'>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
