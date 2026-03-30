import { useState, useEffect } from 'react'
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
import { sendNoticeSchema, type SendNoticeFormData } from '../data/schema'
import { noticeService } from '../services/notice-service'
import { TaskService } from '@/features/tasks/services/task-service'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MultiSelect } from '@/components/ui/multi-select'

export function SendNoticeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectMembers, setProjectMembers] = useState<{ label: string; value: number }[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const form = useForm<SendNoticeFormData>({
    resolver: zodResolver(sendNoticeSchema),
    defaultValues: {
      title: '',
      content: '',
      noticeType: '0',
      targetType: '0',
      targetUserIds: '',
    },
  })

  const targetType = form.watch('targetType')

  // 获取项目成员列表
  useEffect(() => {
    const fetchProjectMembers = async () => {
      try {
        setLoadingMembers(true)
        const projectId = localStorage.getItem('selected_project_id')
        if (!projectId) {
          return
        }
        const members = await TaskService.getProjectUsers(projectId)
        setProjectMembers(members)
      } catch (error) {
        console.error('获取项目成员失败:', error)
        toast.error('获取项目成员失败')
      } finally {
        setLoadingMembers(false)
      }
    }

    if (targetType === '1') {
      fetchProjectMembers()
    }
  }, [targetType])

  const handleSubmit = async (data: SendNoticeFormData) => {
    try {
      setIsSubmitting(true)
      
      // 处理 targetUserIds
      let targetUserIds: string | number[] | undefined = undefined
      if (data.targetType === '1' && data.targetUserIds) {
        targetUserIds = data.targetUserIds
      }

      await noticeService.sendSystemNotice({
        title: data.title,
        content: data.content,
        noticeType: Number(data.noticeType) as 0 | 1,
        targetType: Number(data.targetType) as 0 | 1,
        targetUserId: targetUserIds,
      })

      toast.success('系统通知发送成功')
      form.reset()
    } catch (error) {
      console.error('发送通知失败:', error)
      toast.error('发送通知失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8 pt-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            发送系统通知
          </CardTitle>
          <CardDescription className="text-base mt-2">
            向全员或指定用户发送系统公告或活动通知
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">通知标题 <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="请输入清晰简洁的通知标题" className="h-12 text-base" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="noticeType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">通知类型 <span className="text-red-500">*</span></FormLabel>
                      <SelectDropdown
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="选择通知类型"
                        items={[
                          { label: '系统公告', value: '0' },
                          { label: '活动通知', value: '1' },
                        ]}
                        isControlled={true}
                        className="h-12"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">发送目标 <span className="text-red-500">*</span></FormLabel>
                      <SelectDropdown
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="选择发送目标"
                        items={[
                          { label: '全体成员', value: '0' },
                          { label: '指定用户', value: '1' },
                        ]}
                        isControlled={true}
                        className="h-12"
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {targetType === '1' && (
                <FormField
                  control={form.control}
                  name="targetUserIds"
                  render={({ field }) => (
                    <FormItem className="animate-in fade-in zoom-in-95 duration-200">
                      <FormLabel className="text-base font-semibold">选择用户 <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={projectMembers.map(m => ({
                            label: m.label,
                            value: String(m.value)
                          }))}
                          selected={field.value ? field.value.split(',') : []}
                          onChange={(selected) => {
                            field.onChange(selected.join(','))
                          }}
                          placeholder={loadingMembers ? "正在加载成员列表..." : "请搜索并选择接收通知的用户"}
                          disabled={loadingMembers}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">通知内容 <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="在此输入详细的通知内容..." 
                        className="min-h-[200px] text-base resize-y p-4" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto px-8">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      正在发送...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      确认发送
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
