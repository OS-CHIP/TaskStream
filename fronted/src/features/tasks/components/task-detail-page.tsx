import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskHeader } from './task-header'
import { TaskBasicInfo } from './task-basic-info'
import { TaskDescription } from './task-description'
import { TaskSubtasks } from './task-subtasks'
import { TaskParentTasks } from './task-parent-tasks'
import { TaskAttachments } from './task-attachments'
import { TaskTimeline } from './task-timeline'
import { TaskComments } from './task-comments'
import type { TaskDetail, TaskStatusType, TaskPriorityType } from '../data/schema'

import { getTaskDetail } from '../services/task-detail-service'
import { TaskService } from '../services/task-service'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import '../i18n/register'



/**
 * 任务详情页面组件
 * 使用Tab布局展示任务的不同信息模块
 */
export function TaskDetailPage() {
  const { taskId } = useParams({ from: '/_authenticated/tasks/$taskId' })
  const navigate = useNavigate()
  const search = useSearch({ from: '/_authenticated/tasks/$taskId' })
  const currentPage = search.page || 1
  const [activeTab, setActiveTab] = useState('basic')
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeName, setTypeName] = useState<string | null>(null)
  const { t } = useTranslation()
  
  // 使用 useRef 来跟踪请求状态，防止重复调用
  const isRequestingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // 获取任务详情数据
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (!taskId || isRequestingRef.current) return
      
      // 取消之前的请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // 创建新的 AbortController
      abortControllerRef.current = new AbortController()
      isRequestingRef.current = true
      
      try {
        setLoading(true)
        setError(null)
        const taskDetail = await getTaskDetail(taskId)
        
        // 检查请求是否被取消
        if (!abortControllerRef.current?.signal.aborted) {
          setTask(taskDetail)
        }
      } catch (err) {
        // 如果是取消请求的错误，不处理
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        
        console.error('获取任务详情失败:', err)
        if (!abortControllerRef.current?.signal.aborted) {
          setError(err instanceof Error ? err.message : '获取任务详情失败')
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoading(false)
        }
        isRequestingRef.current = false
      }
    }

    fetchTaskDetail()
    
    // 清理函数：组件卸载时取消请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      isRequestingRef.current = false
    }
  }, [taskId])

  useEffect(() => {
    const loadTypeName = async () => {
      if (!task?.type) {
        setTypeName(null)
        return
      }
      try {
        const opts = await TaskService.getTaskOptions()
        const match = (opts.types || []).find(t => String(t.value) === String(task.type))
        setTypeName(match ? match.label : null)
      } catch {
        setTypeName(null)
      }
    }
    loadTypeName()
  }, [task?.type])

  const handleEdit = () => {
    // 跳转到编辑页面，使用创建页面的编辑模式，携带来源参数和任务ID，来源URL包含当前页码
    navigate({
      to: '/tasks/create',
      search: { editId: taskId, source: `/tasks?page=${currentPage}` }
    })
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!task || !taskId) return
    
    try {
      const result = await TaskService.updateTaskStatus(taskId, newStatus as TaskStatusType, task.type)
      
      if (!result.success) {
        throw new Error(result.message)
      }
      
      // 更新本地状态
      setTask(prev => prev ? { ...prev, status: newStatus as any } : null)
      
      toast.success(t('tasks.detail.toast.statusUpdated'))
    } catch (error) {
      console.error('更新任务状态失败:', error)
      toast.error(error instanceof Error ? error.message : t('tasks.detail.toast.statusUpdateFailed'))
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!task || !taskId) return
    
    try {
      // 调用更新任务接口，只更新优先级
      // 处理assignee字段，确保传递给API的是number类型
      let assigneeValue: number
      if (typeof task.assignee === 'object' && task.assignee?.id) {
        assigneeValue = parseInt(task.assignee.id)
      } else if (typeof task.assignee === 'number') {
        assigneeValue = task.assignee
      } else {
        assigneeValue = 1 // 默认值
      }
      
      // 处理 tags 字段，将数组转换为逗号分隔的字符串
      const tagsValue = Array.isArray(task.tags) 
        ? task.tags.join(',') 
        : (task.tags || '')
      
      // 处理 customFields 字段
      const customFieldsValue = (task as any).dynamicFields 
        ? JSON.parse((task as any).dynamicFields) 
        : ((task as any).customFields || {})
      
      const updateData = {
        type: task.type || 'default',
        title: task.title,
        description: task.description || '',
        priority: newPriority as TaskPriorityType,
        assignee: assigneeValue,
        startTime: task.startTime,
        dueDate: task.dueDate,
        parentTask: task.parentTask || [],
        estimatedHours: task.estimatedHours,
        status: task.status,
        tags: tagsValue,
        customFields: customFieldsValue
      }
      
      await TaskService.updateTask(taskId, updateData)
      
      // 更新本地状态
      setTask(prev => prev ? { ...prev, priority: newPriority as any } : null)
      
      toast.success(t('tasks.detail.toast.priorityUpdated'))
    } catch (error) {
      console.error('更新任务优先级失败:', error)
      toast.error(error instanceof Error ? error.message : t('tasks.detail.toast.priorityUpdateFailed'))
    }
  }

  const handleAddComment = async () => {
    if (!taskId) return
    
    try {
      // 重新获取任务详情以刷新评论列表
      const updatedTask = await getTaskDetail(taskId)
      setTask(updatedTask)
    } catch (error) {
      console.error('刷新任务详情失败:', error)
      // 即使刷新失败，也不显示错误提示，因为评论已经发布成功
    }
  }

  const handleDownloadAttachment = (attachmentId: string) => {
    if (!task?.attachments) return
    
    const attachment = task.attachments.find(att => att.id === attachmentId)
    if (attachment) {
      // 创建一个临时的a标签来触发下载
      const link = document.createElement('a')
      link.href = attachment.url
      link.download = attachment.name
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handlePreviewAttachment = (attachmentId: string) => {
    if (!task?.attachments) return
    
    const attachment = task.attachments.find(att => att.id === attachmentId)
    if (attachment) {
      // 在新窗口中打开附件
      window.open(attachment.url, '_blank')
    }
  }



  // 加载状态
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">{t('tasks.detail.loading')}</span>
          </div>
        </Card>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="p-6">
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    )
  }

  // 任务不存在
  if (!task) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <Card className="p-6">
          <Alert>
            <AlertDescription>
              {t('tasks.detail.notFound')}
            </AlertDescription>
          </Alert>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card className="p-6">
        {/* 任务头部 */}
        <TaskHeader
          task={task}
          displayTypeName={typeName || undefined}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onTaskUpdate={() => {
            if (taskId) {
              getTaskDetail(taskId).then(setTask).catch(console.error)
            }
          }}
        />

        {/* Tab导航和内容 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">{t('tasks.detail.tabs.basic')}</TabsTrigger>
            <TabsTrigger value="timeline">{t('tasks.detail.tabs.timeline')}</TabsTrigger>
            <TabsTrigger value="comments">{t('tasks.detail.tabs.comments')}</TabsTrigger>
          </TabsList>

          {/* Tab1: 基本信息 */}
          <TabsContent value="basic" className="mt-6">
            <div className="space-y-6">
              <TaskBasicInfo task={task} displayTypeName={typeName || undefined} />
              <TaskDescription task={task} />
              <TaskParentTasks task={task} />
              <TaskSubtasks task={task} />
              <TaskAttachments 
                task={task} 
                onDownloadAttachment={handleDownloadAttachment}
                onPreviewAttachment={handlePreviewAttachment}
                readOnly={true} // 在查看任务详情时设置为只读模式，不显示删除按钮
              />
            </div>
          </TabsContent>

          {/* Tab2: 任务动态 */}
          <TabsContent value="timeline" className="mt-6">
            <TaskTimeline taskId={taskId && !isNaN(parseInt(taskId)) ? parseInt(taskId) : undefined} />
          </TabsContent>

          {/* Tab3: 评论 */}
          <TabsContent value="comments" className="mt-6">
            <TaskComments task={task} onAddComment={handleAddComment} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
