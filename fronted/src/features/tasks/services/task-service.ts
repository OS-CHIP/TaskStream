import { BackendApiResponse } from '@/lib/types/api'
import { CreateTaskFormData, Task, TaskLabel, TaskStatus, TaskPriority, TaskStatusType, TaskPriorityType, TaskLabelType } from '../data/schema'
import { apiClient } from '@/lib/api-client'
import { taskTypeService } from '@/features/templates/services/task-type-service'
import { requestCache } from '@/utils/request-cache'



interface CreateTaskWithAttachments extends Omit<CreateTaskFormData, 'attachments' | 'assignee' | 'assigner'> {
  attachments?: string[] // 改为字符串数组，存储已上传的文件URL
  assignee?: string | number // 支持字符串和数字类型
  assigner?: string | number // 支持字符串和数字类型
  status?: TaskStatusType // 添加状态字段支持
  attachmentIds?: string // 附件ID，用逗号分隔的字符串
  customFields?: Record<string, unknown>
  observers?: string // 观察者ID，逗号分隔的字符串
}

// 任务列表查询请求参数
export interface QueryTaskPageRequest {
  pageNum: string
  pageSize: string
  priority?: string
  projectId: string
  status?: string
  taskTitle?: string  // 添加任务标题搜索参数
  taskCode?: string
  assignee?: string
  assigner?: string
  [property: string]: unknown
}

// 任务列表查询响应数据中的任务对象
export interface TaskRecord {
  label: string
  title: string
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
  id: number
  taskTitle: string
  taskTypeId: number
  projectId: number
  taskDesc: string | null
  description: string | null  // 添加 description 字段支持
  priority: string
  owner: string | null
  dueDate: string | null
  startTime: string | null
  parentId: number | null
  assignee: string | null
  estimatedTime: number
  status: string
  type?: string
  estimatedHours?: number
  completionPercentage?: number
  createdAt?: string
  updatedAt?: string
  dynamicFields?: string
  taskCode?: string
  tags?: string // 添加 tags 字段支持
}

// 任务列表查询响应数据（API原始格式）
export interface QueryTaskPageApiResponse {
  records: TaskRecord[]
  total: number
  size: number
  current: number
  orders: unknown[]
  optimizeCountSql: boolean
  hitCount: boolean
  countId: string | null
  maxLimit: string | null
  searchCount: boolean
  pages: number
}

// 任务列表查询响应数据（转换后格式）
export interface QueryTaskPageResponse {
  records: Task[]
  total: number
  size: number
  current: number
  orders: unknown[]
  optimizeCountSql: boolean
  hitCount: boolean
  countId: string | null
  maxLimit: string | null
  searchCount: boolean
  pages: number
}

// 扁平化任务数据接口（API返回的原始数据结构）
export interface FlatTaskRecord {
  id: number
  taskTitle: string
  taskTypeId: number
  projectId: number
  description: string
  priority: string
  owner: string
  parentId: number
  assignee: string | null
  estimatedHours: number
  status: string
  startTime: string
  dueDate: string | null
  createTime: string
  createBy: string
  updateTime: string
  updateBy: string
  isDeleted: string
  level: number
  path: string
}

// 任务关系接口
export interface TaskRelation {
  id: number
  parentTaskId: number
  childTaskId: number
  relationType: string
  createTime: string
  createBy: number
  isDeleted: string
}

// 多父级任务关系API响应
export interface TasksWithRelationsResponse {
  tasks: FlatTaskRecord[]
  relations: TaskRelation[]
}

// 扁平化任务列表API响应
export interface FlatTaskListResponse {
  code: number
  msg: string
  data: FlatTaskRecord[]
}



// 生成唯一ID
const generateId = () => {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 获取任务类型ID：优先将传入值视为数字ID，否则回退到旧标签映射
const getTaskTypeId = (type: string): number => {
  const parsed = Number(type)
  if (!Number.isNaN(parsed) && parsed > 0) {
    return parsed
  }
  switch (type) {
    case TaskLabel.DESIGN_TASK:
      return 1
    case TaskLabel.TEST_TASK:
      return 2
    case TaskLabel.BUG:
      return 3
    case TaskLabel.DEFAULT:
      return 4
    case TaskLabel.OTHER:
      return 5
    default:
      return 4 // 默认为default类型
  }
}

// 根据任务类型ID获取任务类型标签的反向映射函数
export const getTaskTypeFromId = (taskTypeId: number): TaskLabelType => {
  switch (taskTypeId) {
    case 1:
      return TaskLabel.DESIGN_TASK
    case 2:
      return TaskLabel.TEST_TASK
    case 3:
      return TaskLabel.BUG
    case 4:
      return TaskLabel.DEFAULT
    case 5:
      return TaskLabel.OTHER
    default:
      return TaskLabel.DEFAULT // 默认为default类型
  }
}

// 新增：将 taskTypeId 转换为表单期望的字符串值
export const getTaskTypeStringFromId = (taskTypeId: number): string => {
  switch (taskTypeId) {
    case 1:
      return 'design_task'
    case 2:
      return 'test_task'
    case 3:
      return 'bug'
    case 4:
      return 'default'
    case 5:
      return 'other'
    default:
      return 'default' // 默认为default类型
  }
}

// 格式化日期为本地日期字符串 (YYYY-MM-DD)
const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// 任务服务类
export class TaskService {
  /**
   * 创建新任务
   * @param data 任务表单数据
   * @returns 创建的任务对象
   */
  static async createTask(data: CreateTaskWithAttachments): Promise<Task> {
    // 验证必填字段
    if (!data.type || !data.title || !data.priority || !data.assignee) {
      throw new Error('请填写所有必填字段')
    }

    // 将priority从字符串转换为数值
    const getPriorityNumber = (priority: string): number => {
      switch (priority) {
        case TaskPriority.LOW:
          return 1
        case TaskPriority.MEDIUM:
          return 2
        case TaskPriority.HIGH:
          return 3
        default:
          return 2 // 默认中等优先级
      }
    }

    // 构造API请求参数（使用 JSON 提交）
    const parentIdsArr = data.parentTask && data.parentTask.length > 0
      ? data.parentTask.map(task => typeof task === 'string' ? parseInt(task) : parseInt(task.id))
      : []
    const apiParams = {
      taskTypeId: getTaskTypeId(data.type),
      projectId: localStorage.getItem('selected_project_id') || data.projectId || null,
      taskTitle: data.title,
      description: data.description || '',
      priority: getPriorityNumber(data.priority),
      assignee: typeof data.assignee === 'string' ? parseInt(data.assignee) : data.assignee,
      assigner: typeof data.assigner === 'string' ? parseInt(data.assigner) : data.assigner,
      observers: data.observers || '',
      startTime: data.startTime ? formatDateToLocalString(data.startTime) : '',
      dueDate: data.dueDate ? formatDateToLocalString(data.dueDate) : '',
      estimatedHours: (() => {
        const v = data.estimatedHours != null ? Math.round(Number(data.estimatedHours)) : 0
        return Number.isFinite(v) ? v.toFixed(2) : '0.00'
      })(),
      completionPercentage: typeof data.completionPercentage === 'number' ? data.completionPercentage : 0,
      // 后端期望无值时传空数组
      parentTaskIds: parentIdsArr.length > 0 ? parentIdsArr : [],
      status: data.status || TaskStatus.TODO,
      tags: data.tags || '',
      customFields: data.customFields || {},
      ...(data.attachmentIds && { attachmentIds: data.attachmentIds })
    }

    try {
      // eslint-disable-next-line no-console
      console.log('发送到后端的API参数:', apiParams)
      // eslint-disable-next-line no-console
      console.log('API参数中的tags字段:', apiParams.tags)
      // 调用创建任务API（使用 JSON）
      const response = await apiClient.post<{ code: number; msg: string; data: any }>('/task/createTask', apiParams, { skipErrorHandler: true })
      
      if (response.code !== 200) {
        const err: any = new Error(response.msg || '创建任务失败')
        err.code = response.code
        err.data = response.data
        throw err
      }

      // 使用已上传的附件URL
      const attachmentUrls: string[] = data.attachments || []

      // 构造返回的任务对象（用于前端显示）
      const newTask: Task = {
        id: generateId(),
        title: data.title,
        status: (data.status || TaskStatus.TODO) as TaskStatusType, // 使用传入的状态或默认状态
        // 由于类型值改为任务类型ID，这里统一使用默认标签，避免错误映射
        label: TaskLabel.DEFAULT,
        priority: data.priority,
        // 前端内存态保留选择的类型值（ID字符串）
        type: String(data.type),
        description: data.description || '',
        assignee: typeof data.assignee === 'string' ? parseInt(data.assignee) : data.assignee,
        assigner: typeof data.assigner === 'string' ? parseInt(data.assigner) : data.assigner,
        dueDate: data.dueDate,
        parentTask: data.parentTask || [], // 使用数组格式
        // assignTo: data.assignTo || data.assignee, // 暂时注释掉，因为Task类型中没有此字段
        // projectPhase: data.projectPhase || undefined, // 暂时注释掉，因为Task类型中没有此字段
        estimatedHours: data.estimatedHours,
        completionPercentage: typeof data.completionPercentage === 'number' ? data.completionPercentage : 0,
        attachments: attachmentUrls, // Task类型中attachments是字符串数组
        tags: data.tags ? data.tags.split(',').filter(tag => tag.trim()) : [], // 将逗号分隔的字符串转换为数组
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      return newTask
    } catch (_error) {
      if (_error instanceof Error) {
        throw _error
      }
      throw new Error('创建任务失败，请重试')
    }
  }

  /**
   * 验证任务数据
   * @param data 任务表单数据
   * @returns 验证结果
   */
  static validateTaskData(data: CreateTaskFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证任务类型
    if (!data.type) {
      errors.push('请选择任务类型')
    }

    // 验证任务标题
    if (!data.title || data.title.trim().length === 0) {
      errors.push('请输入任务名称')
    }

    // 验证优先级
    if (!data.priority) {
      errors.push('请选择优先级')
    }

    // 验证负责人
    if (!data.assignee) {
      errors.push('请选择负责人')
    }

    // 验证开始时间
    if (!data.startTime) {
      errors.push('请选择开始时间')
    }

    // 验证截止时间
    if (!data.dueDate) {
      errors.push('请选择截止时间')
    }

    // 开始时间不能晚于截止时间
    if (data.startTime && data.dueDate && data.startTime > data.dueDate) {
      errors.push('开始时间不能晚于截止时间')
    }

    // 验证预估工时
    if (data.estimatedHours === undefined) {
      errors.push('请输入预估工时')
    } else if (data.estimatedHours < 0) {
      errors.push('预估工时不能为负数')
    }

    // 验证标签
    if (!data.tags || data.tags.trim().length === 0) {
      errors.push('请填写标签')
    }

    // 截止时间验证已移除（根据需求不需要校验创建时间）

    // 验证任务描述长度
    if (data.description && data.description.length > 5000) {
      errors.push('任务描述不能超过5000个字符')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取项目用户列表（用于下拉框）
   * @param projectId 项目ID
   * @returns 项目用户下拉框选项
   */
  static async getProjectUsers(projectId: string): Promise<{ label: string; value: number }[]> {
    try {
      const response = await apiClient.postFormData<Array<{
        userId: string | number
        email: string,
        userName: string,
        roleName: string
      }>>('/project/queryProjectUsersByName', {
        id: parseInt(projectId),
        userName: '' // 空字符串表示查询所有成员
      })

      if (response.code !== 200) {
        throw new Error(response.msg || '获取项目成员失败')
      }

      // 将API返回的数据转换为下拉框选项格式
      // label显示用户名，value传递userId（满足用户需求：显示姓名但传参用userId）
      return (response.data || []).map(user => ({
        label: user.userName, // 显示用户姓名
        value: Number(user.userId) // 传参使用userId，转换为数字类型
      }))
    } catch (_error) {
      // console.error('获取项目用户失败:', _error)
      // 如果API失败，返回空数组
      return [] as { label: string; value: number }[]
    }
  }

  /**
   * 搜索项目用户（用于@提及）
   * @param projectId 项目ID
   * @param keyword 搜索关键词
   */
  static async searchProjectUsers(projectId: string, keyword: string = ''): Promise<Array<{
    id: number
    name: string
    email: string
    avatar?: string
  }>> {
    try {
      const response = await apiClient.postFormData<Array<{
        userId: string | number
        email: string,
        userName: string,
        roleName: string
        avatar?: string
      }>>('/project/queryProjectUsersByName', {
        id: parseInt(projectId),
        userName: keyword
      })

      if (response.code !== 200) {
        throw new Error(response.msg || '获取项目成员失败')
      }

      return (response.data || []).map(user => ({
        id: Number(user.userId),
        name: user.userName,
        email: user.email,
        avatar: user.avatar
      }))
    } catch (_error) {
      console.error('搜索项目用户失败:', _error)
      return []
    }
  }

  /**
   * 将API返回的状态值映射到TaskStatus枚举
   * @param apiStatus API返回的状态值
   * @returns TaskStatus枚举值
   */
  private static mapApiStatusToTaskStatus(apiStatus: string): string {
    const statusMap: Record<string, string> = {
      '1': TaskStatus.TODO,        // 待开始
      '2': TaskStatus.IN_PROGRESS, // 进行中
      '3': TaskStatus.DONE,        // 已完成
      '4': TaskStatus.CANCELED,    // 已取消
      '5': TaskStatus.BLOCKED,     // 已阻塞
      '6': TaskStatus.PENDING_REVIEW, // 待review
      '100': TaskStatus.TODO,      // 待审批 -> 映射为待开始
      '101': TaskStatus.DONE,      // 已同意 -> 映射为已完成
      '102': TaskStatus.CANCELED,  // 已拒绝 -> 映射为已取消
      // 如果API返回的是字符串状态，也进行映射
      'todo': TaskStatus.TODO,
      'in_progress': TaskStatus.IN_PROGRESS,
      'in progress': TaskStatus.IN_PROGRESS,
      'done': TaskStatus.DONE,
      'canceled': TaskStatus.CANCELED,
      'blocked': TaskStatus.BLOCKED,
      'pending_review': TaskStatus.PENDING_REVIEW,
      'pending review': TaskStatus.PENDING_REVIEW,
    }
    return statusMap[apiStatus] || TaskStatus.TODO
  }

  /**
   * 将API返回的优先级值映射到TaskPriority枚举
   * @param apiPriority API返回的优先级值
   * @returns TaskPriority枚举值
   */
  private static mapApiPriorityToTaskPriority(apiPriority: string): string {
    const priorityMap: Record<string, string> = {
      '1': TaskPriority.LOW,
      '2': TaskPriority.MEDIUM,
      '3': TaskPriority.HIGH,
      // 如果API返回的是字符串优先级，也进行映射
      'low': TaskPriority.LOW,
      'medium': TaskPriority.MEDIUM,
      'high': TaskPriority.HIGH,
    }
    return priorityMap[apiPriority] || TaskPriority.MEDIUM
  }

  /**
   * 将TaskRecord转换为Task对象
   * @param taskRecord API返回的TaskRecord对象
   * @returns 转换后的Task对象
   */
  private static transformTaskRecordToTask(taskRecord: TaskRecord): Task {
    console.log('转换TaskRecord:', taskRecord)
    console.log('taskDesc字段值:', taskRecord.taskDesc)
    console.log('description字段值:', taskRecord.description)
    console.log('owner字段值:', taskRecord.owner)
    
    // 优先使用 description 字段，如果没有则使用 taskDesc 字段
    const description = taskRecord.description || taskRecord.taskDesc || ''
    
    const result: Task = {
      id: taskRecord.id.toString(),
      title: taskRecord.taskTitle,
      status: TaskService.mapApiStatusToTaskStatus(taskRecord.status) as TaskStatusType,
      // 保持默认标签，避免将未知的 taskTypeId 映射到固定枚举
      label: TaskLabel.DEFAULT as TaskLabelType,
      priority: TaskService.mapApiPriorityToTaskPriority(taskRecord.priority) as TaskPriorityType,
      // 将后端的 taskTypeId 作为前端类型值（字符串）
      type: String(taskRecord.taskTypeId),
      description: description,
      assignee: taskRecord.assignee ? Number(taskRecord.assignee) : undefined,
      assigner: (taskRecord as any).assigner ? Number((taskRecord as any).assigner) : undefined, // 从API响应中获取assigner
      startTime: taskRecord.startTime ? new Date(taskRecord.startTime) : undefined, // 添加startTime字段
      dueDate: taskRecord.dueDate ? new Date(taskRecord.dueDate) : undefined,
      parentTask: taskRecord.parentId ? [taskRecord.parentId.toString()] : [], // 添加parentTask字段，转换为数组格式
      estimatedHours: taskRecord.estimatedHours,
      completionPercentage: typeof (taskRecord as any).completionPercentage === 'number'
        ? (taskRecord as any).completionPercentage
        : (typeof (taskRecord as any).completionPercentage === 'string'
            ? Number((taskRecord as any).completionPercentage)
            : 0),
      attachments: [],
      tags: taskRecord.tags ? taskRecord.tags.split(',').filter(tag => tag.trim()) : [], // 添加 tags 字段映射
      createdAt: new Date(taskRecord.createTime),
      updatedAt: new Date(taskRecord.updateTime),
    }

    ;(result as any).dynamicFields = taskRecord.dynamicFields
    ;(result as any).taskCode = (taskRecord as any).taskCode || taskRecord.taskTitle
    ;(result as any).rawStatus = String(taskRecord.status || '')
    
    console.log('转换后的Task对象:', result)
    console.log('转换后的description:', result.description)
    console.log('转换后的assignee:', result.assignee)
    console.log('转换后的assigner:', result.assigner)
    
    return result
  }

  /**
   * 查询任务列表（分页）
   * @param params 查询参数
   * @param signal 可选的AbortSignal用于取消请求
   * @returns 任务列表分页数据
   */
  static async queryTaskPage(params: QueryTaskPageRequest, signal?: AbortSignal): Promise<QueryTaskPageResponse> {
    try {
      // 构建请求参数，确保筛选参数正确传递
      const requestParams: QueryTaskPageRequest = {
        pageNum: params.pageNum || '1',
        pageSize: params.pageSize || '10',
        projectId: params.projectId || localStorage.getItem('selected_project_id') || '',
        ...(params.status && { status: params.status }), // 只有当status存在时才添加
        ...(params.priority && { priority: params.priority }), // 只有当priority存在时才添加
        ...(params.taskTitle && { taskTitle: params.taskTitle }), // 添加任务标题搜索参数
        ...(params.taskCode && { taskCode: params.taskCode }),
        ...(params.assignee && { assignee: params.assignee }),
        ...(params.assigner && { assigner: params.assigner }),
      }

      console.log('发送到API的筛选参数:', requestParams)

      const response = await apiClient.postFormData<QueryTaskPageApiResponse>('/task/queryTaskPage', requestParams, {
        signal
      })
      
      if (response.code !== 200) {
        throw new Error(response.msg || '查询任务列表失败')
      }

      // 转换API返回的数据格式
      const transformedData: QueryTaskPageResponse = {
        ...response.data,
        records: response.data.records.map(record => TaskService.transformTaskRecordToTask(record))
      }

      return transformedData
    } catch (_error) {
       if (_error instanceof Error) {
         throw _error
       }
       throw new Error('查询任务列表失败，请重试')
     }
  }

  /**
   * 获取任务选项数据
   * @param projectId 项目ID（可选，用于获取项目用户）
   * @returns 任务相关的选项数据
   */
  static async getTaskOptions(projectId?: string) {
    // 如果没有传入 projectId，尝试从 localStorage 获取 selected_project_id
    const effectiveProjectId = projectId || localStorage.getItem('selected_project_id')

    // 使用请求缓存防止短时间内重复请求
    const cacheKey = `taskOptions:${effectiveProjectId || 'none'}`
    return requestCache.get(cacheKey, async () => {
      // 获取项目用户数据
      const assignees = effectiveProjectId ? await TaskService.getProjectUsers(effectiveProjectId) : [
        { label: 'John Doe', value: 1 },
        { label: 'Jane Smith', value: 2 },
        { label: 'Mike Johnson', value: 3 },
        { label: 'Sarah Wilson', value: 4 },
      ]

      // 获取任务类型列表（根据项目ID），失败时回退到内置类型
      let types: { label: string; value: string }[] = []
      if (effectiveProjectId) {
        try {
          const list = await taskTypeService.getTaskTypeList(parseInt(effectiveProjectId))
          types = (list || [])
            .filter((t: any) => !(t.isHidden == true))
            .map((t: any) => ({ label: String(t.name || t.taskTypeName || '未命名类型'), value: String(t.id) }))
        } catch {
          types = [
            { label: 'Design Task', value: TaskLabel.DESIGN_TASK },
            { label: 'Test Task', value: TaskLabel.TEST_TASK },
            { label: 'Bug', value: TaskLabel.BUG },
            { label: 'Default', value: TaskLabel.DEFAULT },
            { label: 'Other', value: TaskLabel.OTHER },
          ]
        }
      } else {
        types = [
          { label: 'Design Task', value: TaskLabel.DESIGN_TASK },
          { label: 'Test Task', value: TaskLabel.TEST_TASK },
          { label: 'Bug', value: TaskLabel.BUG },
          { label: 'Default', value: TaskLabel.DEFAULT },
          { label: 'Other', value: TaskLabel.OTHER },
        ]
      }

      return {
        types,
        priorities: [
          { label: 'Low', value: TaskPriority.LOW, numericValue: 1 },
          { label: 'Medium', value: TaskPriority.MEDIUM, numericValue: 2 },
          { label: 'High', value: TaskPriority.HIGH, numericValue: 3 },
        ],
        assignees,
        projectPhases: [
          { label: 'Requirement Analysis', value: 'requirement' },
          { label: 'Design Phase', value: 'design' },
          { label: 'Development Phase', value: 'development' },
          { label: 'Testing Phase', value: 'testing' },
          { label: 'Deployment', value: 'deployment' },
        ],
        parentTasks: [
          { label: 'User Management Module', value: 'user-management' },
          { label: 'Permission System', value: 'permission-system' },
          { label: 'Data Analysis', value: 'data-analysis' },
        ],
      }
    })
  }

  /**
   * 搜索父任务
   */
  static async searchParentTasks(params: {
    projectId: string
    search?: string
    pageSize?: number
  }): Promise<QueryTaskPageResponse> {
    const formData = new FormData()
    formData.append('pageNum', '1')
    formData.append('pageSize', (params.pageSize || 10).toString())
    formData.append('projectId', params.projectId)
    formData.append('taskTitle', params.search || '')

    try {
      const response = await apiClient.post<QueryTaskPageResponse>('/task/queryTaskPage', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('Failed to search parent tasks:', error)
      return {
        records: [],
        total: 0,
        size: 0,
        current: 1,
        orders: [],
        optimizeCountSql: false,
        hitCount: false,
        countId: null,
        maxLimit: null,
        searchCount: false,
        pages: 0,
      }
    }
  }

  /**
   * 获取任务详情
   * @param taskId 任务ID
   * @returns 任务详情数据
   */
  static async getTaskDetail(taskId: string): Promise<Task> {
    try {
      const response = await apiClient.get<TaskRecord>(`/task/selectOne/${taskId}`)
      
      if (response.code !== 200) {
        throw new Error(response.msg || '获取任务详情失败')
      }

      // 转换API返回的数据为Task对象
      return TaskService.transformTaskRecordToTask(response.data)
    } catch (_error) {
      if (_error instanceof Error) {
        throw _error
      }
      throw new Error('获取任务详情失败，请重试')
    }
  }

  /**
   * 更新任务
   * @param taskId 任务ID
   * @param data 任务表单数据
   * @returns 更新后的任务对象
   */
  static async updateTask(taskId: string, data: CreateTaskWithAttachments): Promise<Task> {
    // 验证必填字段
    if (!data.type || !data.title || !data.priority || !data.assignee) {
      throw new Error('请填写所有必填字段')
    }

    // 将priority从字符串转换为数值
    const getPriorityNumber = (priority: string): number => {
      switch (priority) {
        case TaskPriority.LOW:
          return 1
        case TaskPriority.MEDIUM:
          return 2
        case TaskPriority.HIGH:
          return 3
        default:
          return 2 // 默认中等优先级
      }
    }

    // 构造API请求参数（使用 FormData 提交）
    const parentIdsArr = data.parentTask && data.parentTask.length > 0
      ? data.parentTask.map(task => typeof task === 'string' ? parseInt(task) : parseInt(task.id))
      : []
    const apiParams = {
      id: parseInt(taskId),
      taskTypeId: getTaskTypeId(data.type),
      projectId: localStorage.getItem('selected_project_id') || data.projectId || null,
      taskTitle: data.title,
      description: data.description || '',
      priority: getPriorityNumber(data.priority),
      assignee: typeof data.assignee === 'string' ? parseInt(data.assignee) : data.assignee,
      assigner: typeof data.assigner === 'string' ? parseInt(data.assigner) : data.assigner,
      observers: data.observers || '',
      startTime: data.startTime ? formatDateToLocalString(data.startTime) : '',
      dueDate: data.dueDate ? formatDateToLocalString(data.dueDate) : '',
      estimatedHours: (() => {
        const v = data.estimatedHours != null ? Math.round(Number(data.estimatedHours)) : 0
        return Number.isFinite(v) ? v.toFixed(2) : '0.00'
      })(),
      // 后端期望无值时传空数组
      parentTaskIds: parentIdsArr.length > 0 ? parentIdsArr : [],
      tags: data.tags || '',
      customFields: data.customFields || {},
      ...(data.attachmentIds && { attachmentIds: data.attachmentIds })
    }

    try {
      // 调用更新任务API（使用 JSON）
      const response = await apiClient.post<{ code: number; msg: string; data: any }>('/task/updateTask', apiParams, { skipErrorHandler: true })
      
      if (response.code !== 200) {
        const err: any = new Error(response.msg || '更新任务失败')
        err.code = response.code
        err.data = response.data
        throw err
      }

      // 构造返回的任务对象（用于前端显示）
      const updatedTask: Task = {
        id: taskId,
        title: data.title,
        status: (data.status || TaskStatus.TODO) as TaskStatusType, // 使用传入的状态或默认状态
        label: TaskLabel.DEFAULT,
        priority: data.priority,
        type: String(data.type),
        description: data.description || '',
        assignee: typeof data.assignee === 'string' ? parseInt(data.assignee) : data.assignee,
        assigner: typeof data.assigner === 'string' ? parseInt(data.assigner) : data.assigner,
        dueDate: data.dueDate,
        parentTask: data.parentTask || [], // 使用数组格式
        estimatedHours: data.estimatedHours,
        completionPercentage: typeof data.completionPercentage === 'number' ? data.completionPercentage : 0,
        attachments: data.attachments || [],
        tags: data.tags ? data.tags.split(',').filter(tag => tag.trim()) : [], // 将逗号分隔的字符串转换为数组
        createdAt: new Date(), // 实际应该保持原创建时间
        updatedAt: new Date(),
      }

      return updatedTask
    } catch (_error) {
      if (_error instanceof Error) {
        throw _error
      }
      throw new Error('更新任务失败，请重试')
    }
  }

  /**
   * 更新任务状态
   * @param taskId 任务ID
   * @param newStatus 新状态
   * @returns 更新结果
   */
  static async updateTaskStatus(taskId: string, newStatus: TaskStatusType, taskTypeId?: string | number): Promise<{ success: boolean; message: string }> {
    try {
      const isSystemOrder = String(taskTypeId ?? '').trim() === '1'
      const getStatusNumber = (status: TaskStatusType): string => {
        if (isSystemOrder) {
          switch (status) {
            case TaskStatus.DONE:
              return '101' // 已同意
            case TaskStatus.CANCELED:
              return '102' // 已拒绝
            default:
              return '100' // 待审批
          }
        } else {
          switch (status) {
            case TaskStatus.TODO:
              return '1'
            case TaskStatus.IN_PROGRESS:
              return '2'
            case TaskStatus.DONE:
              return '3'
            case TaskStatus.CANCELED:
              return '4'
            case TaskStatus.BLOCKED:
              return '5'
            case TaskStatus.PENDING_REVIEW:
              return '6'
            default:
              return '1'
          }
        }
      }

      const apiParams = {
        taskId: parseInt(taskId),
        status: getStatusNumber(newStatus)
      }

      const response = await apiClient.post<{ code: number; msg: string; data: null }>('/task/updateTaskStatus', apiParams)
      
      if (response.code !== 200) {
        throw new Error(response.msg || '更新任务状态失败')
      }

      return {
        success: true,
        message: '任务状态更新成功'
      }
    } catch (_error) {
      if (_error instanceof Error) {
        return {
          success: false,
          message: _error.message
        }
      }
      return {
        success: false,
        message: '更新任务状态失败，请重试'
      }
    }
  }

  /**
   * 仅更新任务完成进度
   */
  static async updateTaskCompletion(taskId: string, completionPercentage: number): Promise<{ success: boolean; message: string }> {
    try {
      const apiParams = {
        taskId: parseInt(taskId),
        completionPercentage
      }
      const response = await apiClient.post<{ code: number; msg: string; data: null }>('/task/updateTaskStatus', apiParams)
      if (response.code !== 200) {
        throw new Error(response.msg || '更新任务进度失败')
      }
      return {
        success: true,
        message: '任务进度更新成功'
      }
    } catch (_error) {
      if (_error instanceof Error) {
        return {
          success: false,
          message: _error.message
        }
      }
      return {
        success: false,
        message: '更新任务进度失败，请重试'
      }
    }
  }

  /**
   * 删除任务
   */
  static async deleteTask(id: number): Promise<BackendApiResponse<{ code: number; msg: string; data: null }>> {
    const response = await apiClient.get<{ code: number; msg: string; data: null }>(`/task/deleteTask/${id}`)
    return response
  }

  /**
   * 获取带层级信息的扁平化任务列表
   * @param taskId 任务ID，用于获取该任务及其相关的任务树
   * @returns 扁平化的任务列表
   */
  static async getFlatTaskList(taskId: string): Promise<FlatTaskRecord[]> {
    try {
      const formData = new FormData()
      formData.append('taskId', taskId)
      
      const response = await apiClient.post<FlatTaskRecord[]>('/task/getAllTasksWithLevel', formData)
      
      if (response.code === 200 && response.data) {
        return response.data
      } else {
        throw new Error(response.msg || '获取扁平化任务列表失败')
      }
    } catch (error) {
      console.error('获取扁平化任务列表失败:', error)
      throw error
    }
  }

  /**
   * 获取任务的多重父子关系数据
   * @param taskId 任务ID
   * @returns 任务关系数据
   */
  static async getTasksWithMultipleParentsAndChildren(taskId: string): Promise<TasksWithRelationsResponse> {
    try {
      // 从localStorage获取项目ID
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        throw new Error('未找到项目ID，请先选择项目')
      }

      const response = await apiClient.get<TasksWithRelationsResponse>(`/task/getTasksWithMultipleParentsAndChildren/${taskId}`)
      
      if (response.code === 200 && response.data) {
        return response.data
      } else {
        throw new Error(response.msg || '获取任务关系数据失败')
      }
    } catch (error) {
      console.error('获取任务关系数据失败:', error)
      throw error
    }
  }

  /**
   * 将扁平化任务数据转换为组件所需的Task格式
   * @param flatTask 扁平化任务数据
   * @returns 转换后的Task对象
   */
  static transformFlatTaskToTask(flatTask: FlatTaskRecord): Task & { level: number; path: string } {
    return {
      id: flatTask.id.toString(),
      title: flatTask.taskTitle,
      description: flatTask.description || '',
      status: this.mapApiStatusToTaskStatus(flatTask.status) as TaskStatusType,
      priority: this.mapApiPriorityToTaskPriority(flatTask.priority) as TaskPriorityType,
      label: TaskLabel.DEFAULT, // 默认标签
      type: '任务', // 默认类型
      assignee: flatTask.assignee ? parseInt(flatTask.assignee) : undefined,
      dueDate: flatTask.dueDate ? new Date(flatTask.dueDate) : undefined,
      startTime: flatTask.startTime ? new Date(flatTask.startTime) : undefined,
      parentTask: flatTask.parentId ? [flatTask.parentId.toString()] : [], // 转换为数组格式
      projectPhase: '开发阶段', // 默认项目阶段
      estimatedHours: flatTask.estimatedHours,
      createdAt: new Date(flatTask.createTime),
      updatedAt: new Date(flatTask.updateTime),
      attachments: [], // 默认空附件
      level: flatTask.level,
      path: flatTask.path
    }
  }

  /**
   * 分页查询关于我的任务列表（/my-tasks 使用）
   * 兼容业务码为 0 或 200 的后端实现
   */
  static async queryMyTasksPage(params: QueryTaskPageRequest, signal?: AbortSignal): Promise<QueryTaskPageResponse> {
    try {
      let userId: string | undefined
      const cachedUserInfo = localStorage.getItem('user_info_cache')
      if (cachedUserInfo) {
        try {
          const parsed = JSON.parse(cachedUserInfo)
          userId = (parsed?.id ?? '').toString()
        } catch (_) {
          userId = undefined
        }
      }

      const requestParams: QueryTaskPageRequest = {
        pageNum: params.pageNum || '1',
        pageSize: params.pageSize || '10',
        projectId: params.projectId || localStorage.getItem('selected_project_id') || '',
        ...(params.status && { status: params.status }),
        ...(params.priority && { priority: params.priority }),
        ...(params.taskTitle && { taskTitle: params.taskTitle }),
        ...(params.taskCode && { taskCode: params.taskCode }),
        ...(userId && { assignee: userId }),
        ...(userId && { assigner: userId }),
      }

      const endpoint = import.meta.env.VITE_MY_TASKS_API_PATH || '/task/queryTaskPage'

      const response = await apiClient.postFormData<QueryTaskPageApiResponse>(endpoint, requestParams, {
        signal,
        skipErrorHandler: true,
      })

      if (!(response.code === 0 || response.code === 200)) {
        throw new Error(response.msg || '查询关于我的任务列表失败')
      }

      const data = (response as any).data as QueryTaskPageApiResponse
      const transformed: QueryTaskPageResponse = {
        ...data,
        records: (data.records || []).map((record) => TaskService.transformTaskRecordToTask(record)),
      }

      return transformed
    } catch (_error) {
      if (_error instanceof Error) {
        throw _error
      }
      throw new Error('查询关于我的任务列表失败，请重试')
    }
  }

  /**
   * 获取标签列表
   * @param keyword 搜索关键词
   * @returns 标签列表
   */
  static async getTags(keyword: string): Promise<string[]> {
    try {
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        return []
      }
      const url = `/task/selectTagList/${projectId}`
      const response = await apiClient.get<string[]>(url)
      
      if (response.code === 200 && Array.isArray(response.data)) {
        // 如果有关键词，在客户端进行过滤
        if (keyword) {
          return response.data.filter(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
        }
        return response.data
      }
      return []
    } catch (error) {
      console.error('Failed to fetch tags:', error)
      return []
    }
  }

  /**
   * 创建子项目 OA 工单
   * 使用 userName 作为描述信息来源，而不是 email
   */
  static async createSubProjectOa(params: { title: string; taskId?: string; projectId?: string }): Promise<{ success: boolean; message: string }> {
    try {
      const projectId = params.projectId || localStorage.getItem('selected_project_id') || ''
      const cachedUserInfoStr = localStorage.getItem('user_info_cache')
      let userName = ''
      if (cachedUserInfoStr) {
        try {
          const parsed = JSON.parse(cachedUserInfoStr)
          userName = parsed?.userName || ''
        } catch {}
      }
      const payload = {
        title: params.title,
        description: userName,
        projectId,
        ...(params.taskId && { taskId: params.taskId }),
      }
      const res = await apiClient.post<{ code: number; msg: string; data: any }>('/task/createSubProjectOa', payload, { skipErrorHandler: true })
      if (res.code !== 200) {
        throw new Error(res.msg || '创建子项目OA工单失败')
      }
      return { success: true, message: res.msg || '创建成功' }
    } catch (_error) {
      if (_error instanceof Error) {
        return { success: false, message: _error.message }
      }
      return { success: false, message: '创建子项目OA工单失败，请重试' }
    }
  }
}

// 导出常用方法
export const { updateTaskStatus } = TaskService
