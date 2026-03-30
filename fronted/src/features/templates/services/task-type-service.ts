import { apiClient } from '@/lib/api-client'
import type {
  TaskType,
  TaskTypeDetailResponse,
  CreateTaskTypeRequest,
  UpdateTaskTypeRequest,
  DeleteTaskTypeResponse,
  SaveTaskTypeRequest,
} from '@/types/task-type'
import type { TemplateField } from '@/types/templates'
import { showError } from '@/utils/error-handler'

/**
 * 任务类型服务
 * 负责处理任务类型相关的API调用
 */
export class TaskTypeService {
  /**
   * 获取项目任务类型列表
   */
  async getTaskTypeList(projectId: number): Promise<TaskType[]> {
    try {
      // 后端返回格式: { code, msg, data: TaskType[] }
      const response = await apiClient.get<TaskType[]>(`/taskTemplate/getTaskTypeListByProjectId/${projectId}`)
      if (response.code === 200) {
        const list = response.data || []
        // 兼容后端返回的 isHidden 字段，派生出 status（1:启用, 0:禁用）
        return list.map((item: any) => ({
          ...item,
          status: typeof item.status === 'number' ? item.status : (item.isHidden ? 0 : 1),
        }))
      } else {
        throw new Error(response.msg || '获取任务类型列表失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 获取任务类型详情
   */
  async getTaskTypeDetail(taskTypeId: number): Promise<TaskType> {
    try {
      // 已不再用于模板字段渲染，仅保留兼容（名称/描述）。
      const response = await apiClient.get<TaskTypeDetailResponse>(`/taskType/getTaskTypeDetail?taskTypeId=${taskTypeId}`)
      if (response.code === 200) {
        return response.data.data
      } else {
        throw new Error(response.msg || '获取任务类型详情失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 获取模板下的动态字段定义（用于渲染表单）
   * 替换旧接口：/taskType/getTaskTypeDetail?taskTypeId=xxx
   * 返回前端 TemplateField 结构，支持 options 为 JSON 字符串或逗号分隔字符串两种格式
   */
  async getTemplateFields(taskTypeId: number): Promise<TemplateField[]> {
    try {
      const base = (import.meta.env.VITE_API_GET_TASK_TEMPLATE_FIELDS as string) || `/taskTemplate/getTemplateFieldsByTaskTypeId/${taskTypeId}`
      const response = await apiClient.get<Array<{ id: number; taskTypeId: number; name: string; type: string; label: string; isRequired: boolean; options: string | null; sort: number; isSelect?: boolean }>>(base)
      if (response.code !== 200) {
        throw new Error(response.msg || '获取模板字段失败')
      }

      const list = (response.data || [])
      const fields: TemplateField[] = list.map((f) => {
        const nameText = String(f.label || f.name || '')
        const isMarkdownLike = /编辑器|markdown|md/i.test(nameText)
        const type = ((f.type === 'markdown' || (f.type === 'textarea' && isMarkdownLike)) ? 'markdown' : f.type) as TemplateField['type']
        let options: { label: string; value: string }[] | undefined

        // 仅在 select 类型时解析 options
        if (type === 'select' || f.isSelect) {
          const raw = f.options || ''
          let parsed: unknown = null
          if (typeof raw === 'string' && raw.trim()) {
            try {
              parsed = JSON.parse(raw)
            } catch {
              parsed = raw
            }
          }

          if (Array.isArray(parsed)) {
            options = (parsed as any[])
              .map((opt: any) => {
                const label = String(opt.label ?? opt.value ?? '').trim()
                const value = String(opt.value ?? opt.label ?? '').trim()
                if (!label && !value) return null
                return { label: label || value, value: value || label }
              })
              .filter(Boolean) as { label: string; value: string }[]
          } else if (typeof parsed === 'string') {
            const arr = parsed
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
            if (arr.length > 0) {
              options = arr.map((s) => ({ label: s, value: s }))
            }
          }
        }

        return {
          id: String(f.id),
          remoteId: f.id,
          name: f.label || f.name,
          type,
          required: !!f.isRequired,
          ...(options ? { options } : {}),
        }
      })

      return fields
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 创建任务类型
   */
  async createTaskType(data: CreateTaskTypeRequest): Promise<TaskType> {
    try {
      const response = await apiClient.post<TaskTypeDetailResponse>('/taskType/createTaskType', data)
      if (response.code === 200) {
        return response.data.data
      } else {
        throw new Error(response.msg || '创建任务类型失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 保存任务类型模板（新接口）
   */
  async saveTaskType(data: SaveTaskTypeRequest): Promise<void> {
    try {
      const response = await apiClient.post<null>('/taskTemplate/saveTaskType', data)
      if (response.code !== 200) {
        throw new Error(response.msg || '保存任务类型模板失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 保存自定义字段信息
   * 与后端接口对接：保存某个任务类型下的单个字段配置
   *
   * 约定字段结构：
   * - taskTypeId: 任务类型ID
   * - name: 字段唯一键（使用前端字段id或规范化名称）
   * - type: 字段类型（text/number/date/select/textarea）
   * - label: 字段展示名称
   * - isRequired: 是否必填
   * - isHidden: 是否隐藏
   * - options: 下拉选项，逗号分隔字符串或 null
   * - sort: 排序序号（从1开始）
   */
  async saveCustomFields(data: {
    taskTypeId: number
    name: string
    type: string
    label: string
    isRequired: boolean
    isHidden: boolean
    options: string | null
    sort: number
  }): Promise<void> {
    try {
      // 调试输出：打印发送参数
      // eslint-disable-next-line no-console
      console.log('[TaskTypeService.saveCustomFields] 请求参数:', data)
      // 使用模板相关的保存接口路径，若后端有不同路径，可通过环境变量覆盖
      const endpoint = (import.meta.env.VITE_API_SAVE_TASK_TEMPLATE as string) || '/taskTemplate/saveTaskTemplate'
      const response = await apiClient.post<null>(endpoint, data)
      if (response.code !== 200) {
        throw new Error(response.msg || '保存自定义字段失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

 async updateTemplateField(data: {
    taskTypeId?: number | string
    taskFieldId?: number | string
    name: string
    type: string
    label: string
    isRequired: boolean
    isHidden: boolean
    options: string | null
    sort: number
  }): Promise<void> {
    try {
      const endpoint = (import.meta.env.VITE_API_UPDATE_TASK_TEMPLATE as string) || '/taskTemplate/updateTaskTemplate'
      console.log('[TaskTypeService.updateTemplateField] 请求参数:', data, 'endpoint:', endpoint)
      const response = await apiClient.post<null>(endpoint, data)
      if (response.code !== 200) {
        throw new Error(response.msg || '保存自定义字段失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 更新任务类型
   */
  async updateTaskType(taskTypeId: number, data: UpdateTaskTypeRequest): Promise<void> {
    try {
      // 从本地缓存获取项目ID
      const projectIdStr = localStorage.getItem('selected_project_id')
      if (!projectIdStr) {
        throw new Error('未找到项目ID，请先选择项目')
      }
      const projectId = parseInt(projectIdStr)

      // 兼容：若未传 isHidden，则默认根据 status 派生（调用方可传入）
      const payload = {
        taskTypeId,
        name: data.name,
        description: data.description,
        projectId,
        isHidden: typeof data.isHidden === 'boolean' ? data.isHidden : false,
      }

      // 使用模板更新接口（POST）
      const response = await apiClient.post<null>('/taskTemplate/updateTaskType', payload)
      if (response.code !== 200) {
        throw new Error(response.msg || '更新任务类型失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  /**
   * 删除任务类型
   */
  async deleteTaskType(taskTypeId: number): Promise<void> {
    try {
      // 按最新API文档，使用 GET /taskTemplate/deleteTaskType/{id}
      const response = await apiClient.get<DeleteTaskTypeResponse>(`/taskTemplate/deleteTaskType/${taskTypeId}`)
      if (response.code !== 200) {
        throw new Error(response.msg || '删除任务类型失败')
      }
    } catch (error) {
      showError(error)
      throw error
    }
  }

  async deleteTemplateField(fieldId: number): Promise<string> {
    try {
      const url = `/taskTemplate/deleteTaskTemplate/${fieldId}`
      console.log('[TaskTypeService.deleteTemplateField] 请求:', url)
      const response = await apiClient.get<{ code: number; msg: string; data: null }>(url)
      if (response.code !== 200 && response.code !== 0) {
        throw new Error(response.msg || '删除自定义字段失败')
      }
      return response.msg || '删除成功'
    } catch (error) {
      showError(error)
      throw error
    }
  }
}

// 创建单例实例
export const taskTypeService = new TaskTypeService()
