import { z } from 'zod'

export const sendNoticeSchema = z.object({
  title: z.string().min(1, '请输入通知标题'),
  content: z.string().min(1, '请输入通知内容'),
  noticeType: z.enum(['0', '1']), // 0: 公告, 1: 活动
  targetType: z.enum(['0', '1']), // 0: 全体, 1: 指定用户
  targetUserIds: z.string().optional(), // 逗号分隔的用户ID
}).refine(data => {
  if (data.targetType === '1' && !data.targetUserIds) return false
  return true
}, { 
  message: "请选择接收用户", 
  path: ["targetUserIds"] 
})

export type SendNoticeFormData = z.infer<typeof sendNoticeSchema>
