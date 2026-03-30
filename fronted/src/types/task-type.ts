// 任务类型相关类型定义

// 任务类型接口
export interface TaskType {
  id: number
  name: string
  description: string
  projectId: number
  createBy: number
  createTime: string
  updateTime: string
  status: number // 1: 启用, 0: 禁用
  // 兼容后端返回的隐藏字段
  isHidden?: boolean
}

// 创建任务类型请求参数
export interface CreateTaskTypeRequest {
  name: string
  description?: string
  projectId: number
}

// 保存任务类型模板请求参数（后端 /taskTemplate/saveTaskType）
export interface SaveTaskTypeRequest {
  name: string
  description?: string
  projectId: number
  isHidden: boolean
}

// 更新任务类型请求参数
export interface UpdateTaskTypeRequest {
  name?: string
  description?: string
  // 兼容模板更新接口
  isHidden?: boolean
}

// 任务类型列表响应
export interface TaskTypeListResponse {
  code: number
  msg: string
  data: TaskType[]
}

// 任务类型详情响应
export interface TaskTypeDetailResponse {
  code: number
  msg: string
  data: TaskType
}

// 删除任务类型响应
export interface DeleteTaskTypeResponse {
  code: number
  msg: string
  data: null
}