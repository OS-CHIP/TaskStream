import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TaskHeader } from '@/features/tasks/components/task-header'
import { useNavigate } from '@tanstack/react-router'
import { TaskBasicInfo } from '@/features/tasks/components/task-basic-info'
import { TaskDescription } from '@/features/tasks/components/task-description'
import { TaskSubtasks } from '@/features/tasks/components/task-subtasks'
import { TaskParentTasks } from '@/features/tasks/components/task-parent-tasks'
import { TaskAttachments } from '@/features/tasks/components/task-attachments'
import { TaskTimeline } from '@/features/tasks/components/task-timeline'
import { TaskComments } from '@/features/tasks/components/task-comments'
import { Loader2 } from 'lucide-react'
import { TaskDetail } from '@/features/tasks/data/schema'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { getTaskDetail } from '@/features/tasks/services/task-detail-service'
import { TaskStatusType } from '@/features/tasks/data/schema'
import { TaskService } from '@/features/tasks/services/task-service'
import { toast } from 'sonner'

interface TaskDetailPanelProps {
  taskId: string | null
  className?: string
  onTaskUpdate?: () => void
  onTaskSelect?: (taskId: string) => void
}



export function TaskDetailPanel({ taskId, className, onTaskUpdate, onTaskSelect }: TaskDetailPanelProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('basic')
  const [task, setTask] = useState<TaskDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [priorityUpdating, setPriorityUpdating] = useState(false)

  // 监听 taskId 变化并获取任务详情
  useEffect(() => {
    if (!taskId) {
      setTask(null)
      setError(null)
      return
    }

    const fetchTaskDetail = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const taskDetail = await getTaskDetail(taskId)
        setTask(taskDetail)
      } catch (err) {
        console.error('获取任务详情失败:', err)
        setError(err instanceof Error ? err.message : '获取任务详情失败')
        setTask(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTaskDetail()
  }, [taskId])

  // 如果没有选中任务
  if (!taskId) {
    return (
      <div className={cn('h-full flex flex-col', className)}>
        <div className='flex-shrink-0 p-6 border-b'>
          <h2 className='text-lg font-semibold'>{t('myTasks.taskDetail', '任务详情')}</h2>
        </div>
        <div className='flex-1 flex items-center justify-center text-muted-foreground'>
          <div className='text-center'>
            <div className='text-lg font-medium mb-2'>
              {t('myTasks.emptyState.selectTask.title', '选择一个任务')}
            </div>
            <div className='text-sm'>
              {t('myTasks.emptyState.selectTask.description', '从左侧列表中选择一个任务来查看详情')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 加载中状态
  if (isLoading) {
    return (
      <div className={cn('h-full flex flex-col', className)}>
        <div className='flex-shrink-0 p-6 border-b'>
          <h2 className='text-lg font-semibold'>{t('myTasks.taskDetail', '任务详情')}</h2>
        </div>
        <div className='flex-1 flex items-center justify-center'>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' />
            {t('common.loading', '加载中...')}
          </div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className={cn('h-full flex flex-col', className)}>
        <div className='flex-shrink-0 p-6 border-b'>
          <h2 className='text-lg font-semibold'>{t('myTasks.taskDetail', '任务详情')}</h2>
        </div>
        <div className='flex-1 flex items-center justify-center text-destructive'>
          <div className='text-center'>
            <div className='text-lg font-medium mb-2'>
              {t('common.error', '加载失败')}
            </div>
            <div className='text-sm'>
              {t('myTasks.error.loadTask', '无法加载任务详情，请稍后重试')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 任务不存在
  if (!task) {
    return (
      <div className='h-full flex flex-col'>
        <div className='flex-shrink-0 p-6 border-b'>
          <h2 className='text-lg font-semibold'>{t('myTasks.taskDetail', '任务详情')}</h2>
        </div>
        <div className='flex-1 flex items-center justify-center text-muted-foreground'>
          <div className='text-center'>
            <div className='text-lg font-medium mb-2'>
              {t('myTasks.emptyState.taskNotFound.title', '任务不存在')}
            </div>
            <div className='text-sm'>
              {t('myTasks.emptyState.taskNotFound.description', '所选任务可能已被删除或您没有访问权限')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleEdit = () => {
    if (!taskId) return

    // 跳转到编辑页面，使用创建页面的编辑模式，携带来源参数和任务ID
    navigate({
      to: '/tasks/create',
      search: { editId: taskId, source: `/my-tasks?taskId=${taskId}` }
    })
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!task || !taskId) return

    try {
      setStatusUpdating(true)
      
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
        priority: task.priority,
        assignee: assigneeValue,
        startTime: task.startTime,
        dueDate: task.dueDate,
        parentTask: task.parentTask || [],
        estimatedHours: task.estimatedHours,
        status: newStatus as TaskStatusType,
        tags: tagsValue,
        customFields: customFieldsValue
      }
      
      await TaskService.updateTask(taskId, updateData)
      
      // 更新成功，重新获取任务详情以刷新界面
      const updatedTask = await getTaskDetail(taskId)
      setTask(updatedTask)
      toast.success('任务状态更新成功')
      
      // 调用回调函数刷新任务列表
      onTaskUpdate?.()
    } catch (err) {
      console.error('更新任务状态失败:', err)
      toast.error('状态更新失败，请稍后重试')
    } finally {
      setStatusUpdating(false)
    }
  }

  const handlePriorityChange = async (newPriority: string) => {
    if (!task || !taskId) return
    
    try {
      setPriorityUpdating(true)
      
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
        priority: newPriority as 'low' | 'medium' | 'high',
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
      
      // 显示成功提示
      toast.success('优先级更新成功')
      
      // 重新获取任务详情以刷新界面
      const updatedTask = await getTaskDetail(taskId)
      setTask(updatedTask)
      
      // 调用回调函数刷新任务列表
      onTaskUpdate?.()
      
    } catch (error) {
      console.error('更新优先级失败:', error)
      toast.error('更新优先级失败，请重试')
    } finally {
      setPriorityUpdating(false)
    }
  }

  const handleToggleFavorite = () => {
    // 切换收藏状态逻辑
  }

  // 正常显示任务详情 - 优化独立滚动布局
  return (
    <div className={cn('h-full flex flex-col bg-background', className)}>
      {/* 固定头部 */}
      <div className='flex-shrink-0 p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <TaskHeader
          task={task}
          onEdit={handleEdit}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onToggleFavorite={handleToggleFavorite}
          statusUpdating={statusUpdating}
          priorityUpdating={priorityUpdating}
          onTaskUpdate={() => {
            getTaskDetail(taskId).then(setTask).catch(console.error)
            onTaskUpdate?.()
          }}
        />
      </div>

      {/* Tab导航和内容区域 */}
      <div className='flex-1 flex flex-col min-h-0'>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='h-full flex flex-col'>
          {/* 固定的Tab导航 */}
          <div className='flex-shrink-0 px-6 pt-6 pb-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='basic'>基本信息</TabsTrigger>
              <TabsTrigger value='timeline'>任务动态</TabsTrigger>
              <TabsTrigger value='comments'>评论</TabsTrigger>
            </TabsList>
          </div>

          {/* 可滚动的Tab内容 - 优化滚动体验 */}
          <div className='flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent'>
            {/* Tab1: 基本信息 */}
            <TabsContent value='basic' className='m-0 p-6 space-y-6 data-[state=active]:block data-[state=inactive]:hidden'>
              <TaskBasicInfo 
                task={task} 
                isInMyTasksPage={true}
                onTaskSelect={onTaskSelect}
              />
              <TaskDescription task={task} />
              <TaskParentTasks 
                task={task} 
                isInMyTasksPage={true}
                onTaskSelect={onTaskSelect}
              />
              <TaskSubtasks 
                task={task}
                isInMyTasksPage={true}
                onTaskSelect={onTaskSelect}
              />
              <TaskAttachments task={task} readOnly={true} />
            </TabsContent>

            {/* Tab2: 任务动态 */}
            <TabsContent value='timeline' className='m-0 p-6 data-[state=active]:block data-[state=inactive]:hidden'>
              <TaskTimeline />
            </TabsContent>

            {/* Tab3: 评论 */}
            <TabsContent value='comments' className='m-0 p-6 data-[state=active]:block data-[state=inactive]:hidden'>
              <TaskComments task={task} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}

export default TaskDetailPanel
