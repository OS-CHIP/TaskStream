import { TaskDetail, CreateCommentFormData, CreateSubtaskFormData, TaskStatus, TaskLabel, TaskPriority, TaskStatusType, TaskPriorityType, Subtask } from '../data/schema'
import { apiClient } from '@/lib/api-client'
import { BackendApiResponse } from '@/lib/types/api'
import { TaskService } from './task-service'

// API响应接口定义
interface TaskDetailApiResponse {
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
  id: number
  taskTitle: string
  taskTypeId: number
  projectId: number
  description: string | null
  priority: string
  owner: string | null
  dueDate: string | null
  parentId: number | null
  assignee: string | null
  assigner?: string | null
  estimatedHours: number
  completionPercentage?: number
  status: string | null
  startTime: string | null
  isDeleted: number
  attachments?: AttachmentApiResponse[]
  tags?: string // 后端返回的标签字符串，格式如 "1,2,3"
  dynamicFields?: string
}

// 附件API响应接口定义
interface AttachmentApiResponse {
  id: number
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

// 子任务API响应接口定义
interface SubtaskApiResponse {
  createBy: number
  createTime: string
  updateBy: number
  updateTime: string
  id: number
  taskTitle: string
  taskTypeId: number
  projectId: number
  description: string | null
  priority: string
  owner: string | null
  dueDate: string | null
  parentId: number | null
  assignee: string | null
  estimatedHours: number
  status: string | null
  startTime: string | null
  isDeleted: number
}

// Mock data for task detail
const mockTaskDetail: TaskDetail = {
  id: 'task-001',
  title: '优化用户登录流程',
  status: TaskStatus.IN_PROGRESS,
  label: TaskLabel.DEFAULT,
  priority: TaskPriority.HIGH,
  type: '功能开发',
  description: `## 任务背景

当前用户登录流程存在以下问题：
- 登录页面加载速度较慢
- 用户体验不够友好
- 缺少记住密码功能

## 优化目标

1. **性能优化**：减少登录页面加载时间至2秒以内
2. **体验提升**：增加登录状态记忆功能
3. **安全加强**：实现多因素认证

## 技术方案

- 使用React.lazy()实现组件懒加载
- 集成JWT token自动刷新机制
- 添加Google Authenticator支持

## 验收标准

- [ ] 登录页面加载时间 < 2秒
- [ ] 支持记住登录状态30天
- [ ] 通过安全测试`,
  assignee: 1,
  dueDate: new Date('2024-02-15'),
  parentTask: [], // 修改为空数组

  projectPhase: '开发阶段',
  estimatedHours: 16,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-25'),
  attachments: [
    {
      id: 'att-001',
      name: '登录流程设计图.png',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20login%20interface%20design%20wireframe%20with%20clean%20layout&image_size=landscape_4_3',
      size: 245760,
      type: 'image/png',
      uploadedAt: new Date('2024-01-21'),
      uploadedBy: '李四',
    },
    {
      id: 'att-002',
      name: '技术方案文档.pdf',
      url: '#',
      size: 1048576,
      type: 'application/pdf',
      uploadedAt: new Date('2024-01-22'),
      uploadedBy: '张三',
    },
  ],
  subtasks: [
    {
      id: 'sub-001',
      title: '设计新的登录界面',
      status: TaskStatus.DONE,
      assignee: 3,
      dueDate: new Date('2024-01-30'),
      completed: true,
    },
    {
      id: 'sub-002',
      title: '实现JWT token刷新机制',
      status: TaskStatus.IN_PROGRESS,
      assignee: 1,
      dueDate: new Date('2024-02-05'),
      completed: false,
    },
    {
      id: 'sub-003',
      title: '集成Google Authenticator',
      status: TaskStatus.TODO,
      assignee: 2,
      dueDate: new Date('2024-02-10'),
      completed: false,
    },
  ],
  timeline: [
    {
      id: 'tl-001',
      type: 'created',
      description: '任务已创建',
      timestamp: new Date('2024-01-20T09:00:00'),
      user: '项目经理',
    },
    {
      id: 'tl-002',
      type: 'assigned',
      description: '任务已分配给张三',
      timestamp: new Date('2024-01-20T10:30:00'),
      user: '项目经理',
    },
    {
      id: 'tl-003',
      type: 'status_changed',
      description: '状态从待处理变更为进行中',
      timestamp: new Date('2024-01-21T14:15:00'),
      user: '张三',
    },
    {
      id: 'tl-004',
      type: 'attachment_added',
      description: '添加了设计图附件',
      timestamp: new Date('2024-01-21T16:45:00'),
      user: '李四',
    },
    {
      id: 'tl-005',
      type: 'commented',
      description: '添加了技术方案评论',
      timestamp: new Date('2024-01-25T11:20:00'),
      user: '张三',
    },
  ],
  comments: [
    {
      id: 'comment-001',
      content: `## 技术方案确认

经过团队讨论，确定以下技术方案：

### 前端优化
- 使用 **React.lazy()** 实现组件懒加载
- 采用 **Vite** 构建工具提升开发体验
- 集成 **PWA** 支持离线访问

### 后端改进
- 实现 **JWT refresh token** 机制
- 添加 **Redis** 缓存层
- 支持 **OAuth 2.0** 第三方登录

### 安全措施
- 集成 **Google Authenticator**
- 实现 **设备指纹** 识别
- 添加 **异常登录** 检测

预计开发周期：**2周**`,
      author: '张三',
      createdAt: new Date('2024-01-25T11:20:00'),
    },
    {
      id: 'comment-002',
      content: `看起来方案很全面！有几个建议：

1. **性能监控**：建议集成 Lighthouse CI 进行性能回归测试
2. **用户体验**：考虑添加登录进度指示器
3. **兼容性**：确保在低端设备上也能流畅运行

另外，关于多因素认证的用户引导流程需要仔细设计，避免给用户造成困扰。`,
      author: '李四',
      createdAt: new Date('2024-01-25T14:30:00'),
    },
    {
      id: 'comment-003',
      content: `@张三 @李四 

补充一下测试策略：

- **单元测试**：覆盖率要求 > 80%
- **集成测试**：重点测试登录流程
- **E2E测试**：使用 Playwright 进行自动化测试
- **性能测试**：使用 K6 进行压力测试

预计下周开始开发，有问题随时沟通。`,
      author: '王五',
      createdAt: new Date('2024-01-26T09:15:00'),
    },
  ],
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 将API返回的数据转换为TaskDetail格式
function mapApiResponseToTaskDetail(apiData: TaskDetailApiResponse, parentTask?: { id: string; title: string } | null, userMap?: Map<number, string>): TaskDetail {
  // 获取负责人ID (owner字段)
  const ownerId = apiData.owner ? parseInt(apiData.owner) : undefined
  
  // 获取执行人ID (assignee字段)
  const assigneeId = apiData.assignee ? parseInt(apiData.assignee) : undefined
  // 获取分配人ID (assigner字段)
  const assignerId = apiData.assigner ? parseInt(apiData.assigner) : undefined
  
  // 获取创建人ID (createBy字段)
  const creatorId = apiData.createBy
  
  console.log('mapApiResponseToTaskDetail - 原始数据:', {
    priority: apiData.priority,
    owner: apiData.owner,
    assignee: apiData.assignee,
    assigner: apiData.assigner,
    createBy: apiData.createBy,
    ownerId,
    assigneeId,
    assignerId,
    creatorId
  })
  
  // 将负责人ID转换为用户信息对象
  let ownerInfo: number | { id: string; name: string; avatar?: string } | undefined
  
  if (ownerId && userMap) {
    // 确保ownerId是number类型，因为userMap的key是number类型
    const ownerIdNumber = typeof ownerId === 'string' ? parseInt(ownerId) : ownerId
    const userName = userMap.get(ownerIdNumber)
    if (userName) {
      ownerInfo = {
        id: ownerIdNumber.toString(),
        name: userName
      }
    } else {
      ownerInfo = ownerIdNumber
    }
  } else if (ownerId) {
    ownerInfo = ownerId
  }
  
  // 将执行人ID转换为用户信息对象
  let assigneeInfo: number | { id: string; name: string; avatar?: string } | undefined
  
  if (assigneeId && userMap) {
    // 确保assigneeId是number类型，因为userMap的key是number类型
    const assigneeIdNumber = typeof assigneeId === 'string' ? parseInt(assigneeId) : assigneeId
    const userName = userMap.get(assigneeIdNumber)
    if (userName) {
      assigneeInfo = {
        id: assigneeIdNumber.toString(),
        name: userName
      }
    } else {
      assigneeInfo = assigneeIdNumber
    }
  } else if (assigneeId) {
    assigneeInfo = assigneeId
  }
  
  // 将分配人ID转换为用户信息对象（与 assignee 相同逻辑）
  let assignerInfo: number | { id: string; name: string; avatar?: string } | undefined
  if (assignerId && userMap) {
    const assignerIdNumber = typeof assignerId === 'string' ? parseInt(assignerId) : assignerId
    const userName = userMap.get(assignerIdNumber)
    if (userName) {
      assignerInfo = {
        id: assignerIdNumber.toString(),
        name: userName
      }
    } else {
      assignerInfo = assignerIdNumber
    }
  } else if (assignerId) {
    assignerInfo = assignerId
  }
  
  // 将创建人ID转换为用户信息对象
  let creatorInfo: number | { id: string; name: string; avatar?: string } | undefined
    
  if (creatorId && userMap) {
    // 确保creatorId是number类型，因为userMap的key是number类型
    const creatorIdNumber = typeof creatorId === 'string' ? parseInt(creatorId) : creatorId
    const userName = userMap.get(creatorIdNumber)
    console.log('creatorId处理:', { 
      原始creatorId: creatorId, 
      转换后creatorIdNumber: creatorIdNumber, 
      userName: userName,
      userMapKeys: Array.from(userMap.keys()),
      userMapSize: userMap.size
    })
    if (userName) {
      creatorInfo = {
        id: creatorIdNumber.toString(),
        name: userName
      }
    } else {
      creatorInfo = creatorIdNumber
    }
  } else if (creatorId) {
    creatorInfo = creatorId
  }
  
  // 处理附件数据转换
  const attachments = apiData.attachments?.map(att => ({
    id: att.id.toString(),
    name: att.fileName,
    url: att.url,
    size: att.fileSize,
    type: att.mimeType,
    uploadedAt: new Date(), // API中没有上传时间，使用当前时间
    uploadedBy: '未知用户', // API中没有上传者信息，使用默认值
  })) || []

  // 映射优先级
  const mappedPriority = mapApiPriorityToTaskPriority(apiData.priority)
  
  // 处理标签数据转换
  let tagsArray: string[] = []
  if (apiData.tags) {
    // 如果后端返回的是字符串格式（如 "1,2,3"），转换为数组
    tagsArray = apiData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0)
  }
  
  console.log('mapApiResponseToTaskDetail - 转换后数据:', {
    mappedPriority,
    ownerInfo,
    assigneeInfo,
    assignerInfo,
    creatorInfo,
    原始tags: apiData.tags,
    转换后tags: tagsArray
  })

  const result: TaskDetail & { dynamicFields?: string } = {
    id: apiData.id.toString(),
    title: apiData.taskTitle,
    status: mapApiStatusToTaskStatus(apiData.status || 'todo'),
    // 动态任务类型不再映射固定标签，统一为默认标签
    label: TaskLabel.DEFAULT,
    priority: mappedPriority,
    // 将后端的任务类型ID作为前端类型值（字符串），用于下拉回填
    type: String(apiData.taskTypeId),
    description: apiData.description || '',
    owner: ownerInfo,
    assignee: assigneeInfo,
    assigner: assignerInfo,
    creator: creatorInfo,
    dueDate: apiData.dueDate ? new Date(apiData.dueDate) : undefined,
    startTime: apiData.startTime ? new Date(apiData.startTime) : undefined,
    parentTask: parentTask ? [parentTask] : (apiData.parentId ? [apiData.parentId.toString()] : []), // 转换为数组格式
    projectPhase: '开发阶段', // API中没有此字段，使用默认值
    estimatedHours: apiData.estimatedHours,
    completionPercentage:
      typeof (apiData as any).completionPercentage === 'number'
        ? (apiData as any).completionPercentage
        : (typeof (apiData as any).completionPercentage === 'string'
            ? Number((apiData as any).completionPercentage)
            : 0),
    createdAt: new Date(apiData.createTime),
    updatedAt: new Date(apiData.updateTime),
    // 使用从API获取的附件数据
    attachments: attachments,
    subtasks: [],
    timeline: [],
    comments: [],
    tags: tagsArray // 使用转换后的标签数组
  }

  // 透传动态字段原始字符串，供页面解析渲染
  ;(result as any).dynamicFields = apiData.dynamicFields
  ;(result as any).rawStatus = apiData.status
  return result
}

// 状态映射函数
function mapApiStatusToTaskStatus(apiStatus: string): TaskStatusType {
  const statusMap: Record<string, TaskStatusType> = {
    'todo': TaskStatus.TODO,
    'in_progress': TaskStatus.IN_PROGRESS,
    'done': TaskStatus.DONE,
    'canceled': TaskStatus.CANCELED,
    'blocked': TaskStatus.BLOCKED,
    'pending_review': TaskStatus.PENDING_REVIEW,
    '1': TaskStatus.TODO,        // 待开始
    '2': TaskStatus.IN_PROGRESS, // 进行中
    '3': TaskStatus.DONE,        // 已完成
    '4': TaskStatus.CANCELED,    // 已取消
    '5': TaskStatus.BLOCKED,     // 已阻塞
    '6': TaskStatus.PENDING_REVIEW // 待review
  }
  return statusMap[apiStatus] || TaskStatus.TODO
}



// 优先级映射函数
function mapApiPriorityToTaskPriority(apiPriority: string): TaskPriorityType {
  const priorityMap: Record<string, TaskPriorityType> = {
    '1': TaskPriority.LOW,
    '2': TaskPriority.MEDIUM,
    '3': TaskPriority.HIGH,
    'low': TaskPriority.LOW,
    'medium': TaskPriority.MEDIUM,
    'high': TaskPriority.HIGH
  }
  return priorityMap[apiPriority] || TaskPriority.MEDIUM
}

// 获取子任务列表
export async function getChildrenTasks(taskId: string, userMap?: Map<number, string>): Promise<Subtask[]> {
  try {
    // 如果没有提供 userMap，则获取项目用户信息
    let projectUsers: { label: string; value: number }[] = []
    let finalUserMap = userMap

    if (!finalUserMap) {
      // 从localStorage获取项目ID
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        throw new Error('未找到项目ID')
      }

      // 同时获取子任务列表和项目用户信息
      const [subtasksResponse, projectUsersResponse] = await Promise.all([
        apiClient.get<BackendApiResponse<SubtaskApiResponse[]>>(`/task/getChildrenTasks/${taskId}`),
        TaskService.getProjectUsers(projectId)
      ])
      
      projectUsers = projectUsersResponse
      
      // 创建用户ID到用户名的映射
      finalUserMap = new Map<number, string>()
      projectUsers.forEach(user => {
        finalUserMap!.set(user.value, user.label)
      })

      if (subtasksResponse.code === 200 && subtasksResponse.data) {
        const subtasksData = Array.isArray(subtasksResponse.data) ? subtasksResponse.data : subtasksResponse.data.data || []
        return subtasksData.map(subtask => mapApiResponseToSubtask(subtask, finalUserMap))
      } else {
        throw new Error(subtasksResponse.msg || '获取子任务列表失败')
      }
    } else {
      // 如果已有 userMap，只获取子任务列表
      const subtasksResponse = await apiClient.get<BackendApiResponse<SubtaskApiResponse[]>>(`/task/getChildrenTasks/${taskId}`)
      
      if (subtasksResponse.code === 200 && subtasksResponse.data) {
        const subtasksData = Array.isArray(subtasksResponse.data) ? subtasksResponse.data : subtasksResponse.data.data || []
        return subtasksData.map(subtask => mapApiResponseToSubtask(subtask, finalUserMap))
      } else {
        throw new Error(subtasksResponse.msg || '获取子任务列表失败')
      }
    }
  } catch (error) {
    console.error('获取子任务列表失败:', error)
    // 如果API调用失败，返回空数组
    return []
  }
}

export async function getParentTasks(taskId: string, userMap?: Map<number, string>): Promise<Subtask[]> {
  try {
    // 如果没有提供 userMap，则获取项目用户信息
    let projectUsers: { label: string; value: number }[] = []
    let finalUserMap = userMap

    if (!finalUserMap) {
      // 从localStorage获取项目ID
      const projectId = localStorage.getItem('selected_project_id')
      if (!projectId) {
        throw new Error('未找到项目ID')
      }

      // 同时获取父任务列表和项目用户信息
      const [parentTasksResponse, projectUsersResponse] = await Promise.all([
        apiClient.get<BackendApiResponse<SubtaskApiResponse[]>>(`/task/getParentTasks/${taskId}`),
        TaskService.getProjectUsers(projectId)
      ])

      projectUsers = projectUsersResponse
      
      // 创建用户ID到用户名的映射
      finalUserMap = new Map<number, string>()
      if (projectUsers && Array.isArray(projectUsers)) {
        projectUsers.forEach((user: { label: string; value: number }) => {
          finalUserMap!.set(user.value, user.label)
        })
      }

      if (parentTasksResponse.code === 200 && parentTasksResponse.data) {
        const parentTasksData = Array.isArray(parentTasksResponse.data) ? parentTasksResponse.data : parentTasksResponse.data.data || []
        return parentTasksData.map(parentTask => mapApiResponseToSubtask(parentTask, finalUserMap))
      } else {
        console.error('获取父任务列表失败:', parentTasksResponse.msg)
        return []
      }
    } else {
      // 如果已有 userMap，只获取父任务列表
      const parentTasksResponse = await apiClient.get<BackendApiResponse<SubtaskApiResponse[]>>(`/task/getParentTasks/${taskId}`)

      if (parentTasksResponse.code === 200 && parentTasksResponse.data) {
        const parentTasksData = Array.isArray(parentTasksResponse.data) ? parentTasksResponse.data : parentTasksResponse.data.data || []
        return parentTasksData.map(parentTask => mapApiResponseToSubtask(parentTask, finalUserMap))
      } else {
        console.error('获取父任务列表失败:', parentTasksResponse.msg)
        return []
      }
    }
  } catch (error) {
    console.error('获取父任务列表失败:', error)
    return []
  }
}

// 将API返回的子任务数据转换为Subtask格式
function mapApiResponseToSubtask(apiData: SubtaskApiResponse, userMap?: Map<number, string>): Subtask {
  // 获取负责人ID
  const assigneeId = apiData.owner ? parseInt(apiData.owner) : (apiData.assignee ? parseInt(apiData.assignee) : undefined)
  
  // 将负责人ID转换为用户名
  let assigneeName: string | number | undefined = assigneeId
  if (assigneeId && userMap) {
    assigneeName = userMap.get(assigneeId) || assigneeId
  }
  
  return {
    id: apiData.id.toString(),
    title: apiData.taskTitle,
    status: mapApiStatusToTaskStatus(apiData.status || 'todo'),
    assignee: assigneeName,
    dueDate: apiData.dueDate ? new Date(apiData.dueDate) : undefined,
    completed: mapApiStatusToTaskStatus(apiData.status || 'todo') === TaskStatus.DONE
  }
}

// Service functions
export async function getTaskDetail(taskId: string): Promise<TaskDetail> {
  try {
    // 从localStorage获取项目ID
    const projectId = localStorage.getItem('selected_project_id')
    if (!projectId) {
      throw new Error('未找到项目ID')
    }

    const taskResponse = await apiClient.get<BackendApiResponse<TaskDetailApiResponse>>(`/task/selectOne/${taskId}`)
    
    if (taskResponse.code === 200 && taskResponse.data) {
      const taskData = taskResponse.data.data || taskResponse.data
      
      // 首先获取项目用户信息
      const projectUsers = await TaskService.getProjectUsers(projectId)
      
      // 创建用户ID到用户名的映射
      const userMap = new Map<number, string>()
      if (projectUsers && Array.isArray(projectUsers)) {
        projectUsers.forEach((user: { label: string; value: number }) => {
          userMap.set(user.value, user.label)
        })
      }
      
      // 并行获取子任务列表、父任务列表、父任务信息（如果存在），传递 userMap 避免重复请求
      const promises: Promise<any>[] = [
        getChildrenTasks(taskId, userMap),
        getParentTasks(taskId, userMap)
      ]
      
      // 如果有父任务ID，获取父任务信息
      if (taskData.parentId) {
        promises.push(
          apiClient.get<BackendApiResponse<TaskDetailApiResponse>>(`/task/selectOne/${taskData.parentId}`)
            .then(response => {
              if (response.code === 200 && response.data) {
                const parentData = response.data.data || response.data
                return {
                  id: parentData.id.toString(),
                  title: parentData.taskTitle
                }
              }
              return null
            })
            .catch(error => {
              console.error('获取父任务信息失败:', error)
              return null
            })
        )
      } else {
        promises.push(Promise.resolve(null))
      }
      
      const [subtasks, parentTasks, parentTask] = await Promise.all(promises)
      
      const taskDetail = mapApiResponseToTaskDetail(taskData, parentTask, userMap)
      // 将获取到的子任务列表和父任务列表添加到任务详情中
      taskDetail.subtasks = subtasks
      taskDetail.parentTasks = parentTasks
      return taskDetail
    } else {
      throw new Error(taskResponse.msg || '获取任务详情失败')
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    
    // 如果API调用失败，返回模拟数据作为后备
    console.warn('API调用失败，使用模拟数据')
    return {
      ...mockTaskDetail,
      id: taskId,
      title: `任务 ${taskId}`,
      description: `这是任务 ${taskId} 的详细描述...`,
    }
  }
}

export async function getTaskDetailBasic(taskId: string): Promise<TaskDetail> {
  try {
    const projectId = localStorage.getItem('selected_project_id')
    if (!projectId) {
      throw new Error('未找到项目ID')
    }
    const taskResponse = await apiClient.get<BackendApiResponse<TaskDetailApiResponse>>(`/task/selectOne/${taskId}`)
    if (taskResponse.code === 200 && taskResponse.data) {
      const taskData = taskResponse.data.data || taskResponse.data
      const projectUsers = await TaskService.getProjectUsers(projectId)
      const userMap = new Map<number, string>()
      if (projectUsers && Array.isArray(projectUsers)) {
        projectUsers.forEach((user: { label: string; value: number }) => {
          userMap.set(user.value, user.label)
        })
      }
      const taskDetail = mapApiResponseToTaskDetail(taskData, null, userMap)
      return taskDetail
    } else {
      throw new Error(taskResponse.msg || '获取任务详情失败')
    }
  } catch (error) {
    console.error('获取任务详情失败:', error)
    return {
      ...mockTaskDetail,
      id: taskId,
      title: `任务 ${taskId}`,
      description: `这是任务 ${taskId} 的详细描述...`,
    }
  }
}

export async function updateTaskDetail(taskId: string, updates: Partial<TaskDetail>): Promise<TaskDetail> {
  await delay(500)
  
  // In a real app, this would make an API call
  const updatedTask = {
    ...mockTaskDetail,
    ...updates,
    id: taskId,
    updatedAt: new Date(),
  }
  
  return updatedTask
}

export async function addComment(taskId: string, commentData: CreateCommentFormData): Promise<TaskDetail> {
  await delay(300)
  
  const newComment = {
    id: `comment-${Date.now()}`,
    content: commentData.content,
    author: '当前用户', // In real app, get from auth context
    createdAt: new Date(),
    parentId: commentData.parentId,
  }
  
  const updatedTask = {
    ...mockTaskDetail,
    id: taskId,
    comments: [...(mockTaskDetail.comments || []), newComment],
    updatedAt: new Date(),
  }
  
  return updatedTask
}

export async function addSubtask(taskId: string, subtaskData: CreateSubtaskFormData): Promise<TaskDetail> {
  await delay(400)
  
  const newSubtask = {
    id: `sub-${Date.now()}`,
    title: subtaskData.title,
    status: TaskStatus.TODO,
    assignee: subtaskData.assignee,
    dueDate: subtaskData.dueDate,
    completed: false,
  }
  
  const updatedTask = {
    ...mockTaskDetail,
    id: taskId,
    subtasks: [...(mockTaskDetail.subtasks || []), newSubtask],
    updatedAt: new Date(),
  }
  
  return updatedTask
}

export async function toggleSubtaskComplete(taskId: string, subtaskId: string): Promise<TaskDetail> {
  await delay(200)
  
  const updatedSubtasks = mockTaskDetail.subtasks?.map(subtask => 
    subtask.id === subtaskId 
      ? { ...subtask, completed: !subtask.completed, status: subtask.completed ? TaskStatus.TODO : TaskStatus.DONE }
      : subtask
  )
  
  const updatedTask = {
    ...mockTaskDetail,
    id: taskId,
    subtasks: updatedSubtasks,
    updatedAt: new Date(),
  }
  
  return updatedTask
}

export async function deleteComment(taskId: string, commentId: string): Promise<TaskDetail> {
  await delay(300)
  
  const updatedComments = mockTaskDetail.comments?.filter(comment => comment.id !== commentId)
  
  const updatedTask = {
    ...mockTaskDetail,
    id: taskId,
    comments: updatedComments,
    updatedAt: new Date(),
  }
  
  return updatedTask
}

// 评论API响应接口定义
interface CommentApiResponse {
  id: number
  taskId: number
  content: string
  createTime: string
  createBy: number
}

// 评论树API响应接口定义
interface CommentTreeApiResponse {
  id: number
  taskId: number
  parentId: number
  content: string
  createTime: string
  createBy: number
  level: number
  path: string
  children: CommentTreeApiResponse[]
}

// 注释：mapApiCommentToTaskComment函数已移除，评论转换逻辑已在TaskComments组件中实现

// 获取任务评论列表API接口
export async function getTaskComments(taskId: string): Promise<CommentApiResponse[]> {
  try {
    const response = await apiClient.get<BackendApiResponse<CommentApiResponse[]>>(`/comment/getCommentsByTaskId/${taskId}`)
    
    if (response.code === 200 && response.data) {
      return response.data.data || response.data || []
    } else {
      throw new Error(response.msg || '获取评论列表失败')
    }
  } catch (error) {
    console.error('获取评论列表失败:', error)
    // 返回空数组作为后备
    return []
  }
}

// 获取任务评论树API接口
export async function getTaskCommentsTree(taskId: string): Promise<CommentTreeApiResponse[]> {
  try {
    const response = await apiClient.get<BackendApiResponse<CommentTreeApiResponse[]>>(`/comment/getCommentTree/${taskId}`)
    
    if (response.code === 200 && response.data) {
      return response.data.data || response.data || []
    } else {
      throw new Error(response.msg || '获取评论树失败')
    }
  } catch (error) {
    console.error('获取评论树失败:', error)
    // 返回空数组作为后备
    return []
  }
}

// 发布评论API接口
export async function publishComment(params: { taskId: string; content: string; parentId?: string }): Promise<{ code: number; msg: string; data: null }> {
  try {
    const requestBody: any = {
      taskId: params.taskId,
      content: params.content
    }

    // 如果有parentId，添加到请求体中
    if (params.parentId) {
      requestBody.parentId = params.parentId
    }

    const response = await apiClient.post<{ code: number; msg: string; data: null }>('/comment/publish', requestBody)
    
    return {
      code: response.code,
      msg: response.msg,
      data: null
    }
  } catch (error) {
    console.error('发布评论失败:', error)
    throw error
  }
}
