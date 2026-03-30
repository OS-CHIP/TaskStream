import apiClient from '@/lib/api-client'
import type { BackendApiResponse } from '@/lib/types/api'

/**
 * 更新日志记录接口
 */
export interface UpdateLogRecord {
  id: string
  tableName: string
  recordId: number
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  operationType: 'INSERT' | 'UPDATE' | 'DELETE'
  createBy: number
  createTime: string
  operatorId?: string
  operatorName?: string
  operationTime: string
}

/**
 * 分页查询更新日志请求参数
 */
export interface QueryUpdateLogsRequest {
  currentPage?: string
  pageSize?: string
  tableName?: string // 表名，固定为"task"
  recordId?: number // 任务ID
}

/**
 * 分页查询更新日志响应数据
 */
export interface QueryUpdateLogsResponse {
  records: UpdateLogRecord[]
  total: number
  size: number
  current: number
  orders: string[]
  optimizeCountSql: boolean
  hitCount: boolean
  countId: null
  maxLimit: null
  searchCount: boolean
  pages: number
}

/**
 * 更新日志服务类
 */
export class UpdateLogsService {
  /**
   * 分页查询更新日志
   * @param params 查询参数
   * @returns 更新日志分页数据
   */
  static async queryUpdateLogs(
    params: QueryUpdateLogsRequest
  ): Promise<BackendApiResponse<QueryUpdateLogsResponse>> {
    try {
      // 构建请求参数
      const requestData = {
        currentPage: params.currentPage || '1',
        pageSize: params.pageSize || '10',
        tableName: 'task', // 固定值
        recordId: params.recordId
      }

      // 发送POST请求，使用multipart/form-data格式
      const response = await apiClient.postFormData<QueryUpdateLogsResponse>(
        'updateLogs/queryUpdateLogs',
        requestData
      )

      return response
    } catch (error) {
      console.error('查询更新日志失败:', error)
      throw error
    }
  }

  /**
   * 获取任务的更新日志
   * @param taskId 任务ID
   * @param currentPage 当前页码
   * @param pageSize 每页大小
   * @returns 任务更新日志
   */
  static async getTaskUpdateLogs(
    taskId: number,
    currentPage: number = 1,
    pageSize: number = 10
  ): Promise<BackendApiResponse<QueryUpdateLogsResponse>> {
    return this.queryUpdateLogs({
      currentPage: currentPage.toString(),
      pageSize: pageSize.toString(),
      tableName: 'task',
      recordId: taskId
    })
  }
}

// 导出默认实例
export default UpdateLogsService