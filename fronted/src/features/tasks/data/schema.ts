import { z } from 'zod'

// Task status enum for kanban board
export const TaskStatus = {
  TODO: '1',           // 待开始
  IN_PROGRESS: '2',    // 进行中
  DONE: '3',           // 已完成
  CANCELED: '4',       // 已取消
  BLOCKED: '5',        // 已阻塞
  PENDING_REVIEW: '6'  // 待review
} as const

export type TaskStatusType = typeof TaskStatus[keyof typeof TaskStatus]

// Task priority enum
export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

export type TaskPriorityType = typeof TaskPriority[keyof typeof TaskPriority]

// Task label enum
export const TaskLabel = {
  DESIGN_TASK: 'design_task',
  TEST_TASK: 'test_task',
  BUG: 'bug',
  DEFAULT: 'default',
  OTHER: 'other'
} as const

export type TaskLabelType = typeof TaskLabel[keyof typeof TaskLabel]

// Kanban filter interface
export interface KanbanFilters {
  search?: string
  priority?: TaskPriorityType[]
  label?: TaskLabelType[]
  assignee?: string[]
  status?: TaskStatusType[]
  dueDate?: {
    from?: Date
    to?: Date
  }
}

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELED, TaskStatus.BLOCKED, TaskStatus.PENDING_REVIEW]),
  label: z.enum([TaskLabel.DESIGN_TASK, TaskLabel.TEST_TASK, TaskLabel.BUG, TaskLabel.DEFAULT, TaskLabel.OTHER]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  // Extended fields for task creation
  type: z.string().optional(),
  description: z.string().optional(),
  assignee: z.union([z.number(), z.object({ id: z.string(), name: z.string(), avatar: z.string().optional() })]).optional(),
  assigner: z.union([z.number(), z.object({ id: z.string(), name: z.string(), avatar: z.string().optional() })]).optional(),
  startTime: z.date().optional(),
  dueDate: z.date().optional(),
  parentTask: z.array(z.union([z.string(), z.object({ id: z.string(), title: z.string() })])).default([]),
  taskTypeId: z.union([z.number(), z.string()]).optional(),

  projectPhase: z.string().optional(),
  estimatedHours: z.number().optional(),
  completionPercentage: z.number().min(0).max(100).default(0).optional(),
  attachments: z.array(z.string()).optional(), // Store file URLs
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})

// Schema specifically for creating new tasks
export const createTaskSchema = z.object({
  type: z.string().min(1, '请选择任务类型'),
  title: z.string().min(1, '请输入任务名称'),
  description: z.string().max(2000, '任务描述不能超过2000字符').optional(),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  assignee: z.number().min(1, '请选择负责人'),
  assigner: z.number().min(1, '请选择分配人'),
  observers: z.string().optional(),
  startTime: z.date().optional(),
  dueDate: z.date().optional(),
  parentTask: z.array(z.union([z.string(), z.object({ id: z.string(), title: z.string() })])).default([]),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELED, TaskStatus.BLOCKED, TaskStatus.PENDING_REVIEW]).default(TaskStatus.TODO).optional(), // 添加状态字段，默认为1（待开始）
  estimatedHours: z.number().min(0, '预估工时不能为负数').optional(),
  completionPercentage: z.number().min(0, '完成百分比不能小于0').max(100, '完成百分比不能超过100').default(0).optional(),
  attachments: z.array(z.instanceof(File)).optional(),
  projectId: z.string().optional(), // 添加项目ID字段
  tags: z.string().min(1, '请填写标签'), // 添加标签字段，格式为逗号分隔的字符串
}).refine((data) => {
  // 如果同时设置了开始时间和截止时间，确保开始时间不晚于截止时间
  if (data.startTime && data.dueDate) {
    return data.startTime <= data.dueDate
  }
  return true
}, {
  message: '开始时间不能晚于截止时间',
  path: ['startTime']
})

// Extended schema for task detail page
export const taskDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELED, TaskStatus.BLOCKED, TaskStatus.PENDING_REVIEW]),
  label: z.enum([TaskLabel.DESIGN_TASK, TaskLabel.TEST_TASK, TaskLabel.BUG, TaskLabel.DEFAULT, TaskLabel.OTHER]),
  priority: z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
  type: z.string().optional(),
  description: z.string().optional(),
  assignee: z.union([z.number(), z.object({ id: z.string(), name: z.string(), avatar: z.string().optional() })]).optional(),
  assigner: z.union([z.number(), z.object({ id: z.string(), name: z.string(), avatar: z.string().optional() })]).optional(),
  startTime: z.date().optional(),
  dueDate: z.date().optional(),
  parentTask: z.array(z.union([z.string(), z.object({ id: z.string(), title: z.string() })])).default([]),

  projectPhase: z.string().optional(),
  estimatedHours: z.number().optional(),
  completionPercentage: z.number().min(0).max(100).default(0).optional(),
  attachments: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    size: z.number(),
    type: z.string(),
    uploadedAt: z.date(),
    uploadedBy: z.string(),
  })).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  // Extended fields for task detail
  subtasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELED, TaskStatus.BLOCKED, TaskStatus.PENDING_REVIEW]),
    assignee: z.union([z.number(), z.string()]).optional(),
    dueDate: z.date().optional(),
    completed: z.boolean(),
  })).optional(),
  parentTasks: z.array(z.object({
    id: z.string(),
    title: z.string(),
    status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELED, TaskStatus.BLOCKED, TaskStatus.PENDING_REVIEW]),
    assignee: z.union([z.number(), z.string()]).optional(),
    dueDate: z.date().optional(),
    completed: z.boolean(),
  })).optional(),
  timeline: z.array(z.object({
    id: z.string(),
    type: z.enum(['created', 'updated', 'status_changed', 'assigned', 'commented', 'attachment_added']),
    description: z.string(),
    timestamp: z.date(),
    user: z.string(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })).optional(),
  comments: z.array(z.object({
    id: z.string(),
    content: z.string(), // Markdown content
    author: z.union([
      z.string(),
      z.object({
        id: z.string(),
        name: z.string(),
      })
    ]),
    createdAt: z.date(),
    updatedAt: z.date().optional(),
    parentId: z.string().optional(), // For nested comments
    replies: z.array(z.lazy(() => z.object({
      id: z.string(),
      content: z.string(),
      author: z.union([
        z.string(),
        z.object({
          id: z.string(),
          name: z.string(),
        })
      ]),
      createdAt: z.date(),
      updatedAt: z.date().optional(),
    }))).optional(),
  })).optional(),
})

// Schema for creating new comments
export const createCommentSchema = z.object({
  content: z.string().min(1, '请输入评论内容').max(5000, '评论内容不能超过5000字符'),
  parentId: z.string().optional(),
})

// Schema for creating subtasks
export const createSubtaskSchema = z.object({
  title: z.string().min(1, '请输入子任务标题'),
  assignee: z.number().optional(),
  dueDate: z.date().optional(),
})

export type Task = z.infer<typeof taskSchema> & {
  tags?: string[]
  taskTitle?: string
  taskCode?: string
}
export type TaskDetail = z.infer<typeof taskDetailSchema> & {
  tags?: string[]
  parentTask?: Array<string | { id: string; title: string }>
  assignee?: number | string | { id: string; name: string; avatar?: string }
  assigner?: number | string | { id: string; name: string; avatar?: string }
  owner?: number | string | { id: string; name: string; avatar?: string }
  creator?: number | string | { id: string; name: string; avatar?: string }
}
export type CreateTaskFormData = z.infer<typeof createTaskSchema>
export type CreateCommentFormData = z.infer<typeof createCommentSchema>
export type CreateSubtaskFormData = z.infer<typeof createSubtaskSchema>
export type Subtask = {
  id: string
  title: string
  status: TaskStatusType
  assignee?: number | string
  dueDate?: Date
  completed: boolean
}
export type TaskTimeline = z.infer<typeof taskDetailSchema>['timeline']
export type TaskComment = z.infer<typeof taskDetailSchema>['comments']
export type TaskSubtask = z.infer<typeof taskDetailSchema>['subtasks']
export type TaskAttachment = z.infer<typeof taskDetailSchema>['attachments']

// Kanban specific schemas and types
export const kanbanColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.CANCELED]),
  tasks: z.array(taskSchema),
  maxTasks: z.number().optional(),
})

export const kanbanBoardSchema = z.object({
  columns: z.array(kanbanColumnSchema),
  filters: z.object({
    search: z.string().optional(),
    priority: z.array(z.enum([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH])).optional(),
    label: z.array(z.enum([TaskLabel.DESIGN_TASK, TaskLabel.TEST_TASK, TaskLabel.BUG, TaskLabel.DEFAULT, TaskLabel.OTHER])).optional(),
    assignee: z.array(z.string()).optional(),
    dueDate: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
    }).optional(),
  }).optional(),
})

export const dragDropEventSchema = z.object({
  taskId: z.string(),
  sourceColumnId: z.string(),
  targetColumnId: z.string(),
  sourceIndex: z.number(),
  targetIndex: z.number(),
})

export type KanbanColumn = z.infer<typeof kanbanColumnSchema>
export type KanbanBoard = z.infer<typeof kanbanBoardSchema>
export type DragDropEvent = z.infer<typeof dragDropEventSchema>
