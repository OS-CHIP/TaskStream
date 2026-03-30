import { HttpClient } from './http-client'
import type { BackendApiResponse, RequestConfig, UploadConfig, HttpClientConfig, UploadedFileData } from './types/api'

/**
 * API 客户端封装类
 * 提供类型安全的 HTTP 方法和文件操作功能
 */
export class ApiClient {
  private httpClient: HttpClient
  private pendingRequests: Map<string, Promise<BackendApiResponse<any>>> = new Map()

  constructor(config?: HttpClientConfig) {
    this.httpClient = new HttpClient(config)
  }

  private makeKey(url: string, data?: Record<string, unknown>): string {
    if (!data) return url
    const keys = Object.keys(data).sort()
    const normalized: Record<string, unknown> = {}
    for (const k of keys) normalized[k] = data[k]
    return `${url}::${JSON.stringify(normalized)}`
  }

  /**
   * GET 请求
   */
  public async get<T = unknown>(url: string, config?: RequestConfig): Promise<BackendApiResponse<T>> {
    const response = await this.httpClient.getInstance().get(url, config)
    return response.data
  }

  /**
   * POST 请求
   */
  public async post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<BackendApiResponse<T>> {
    const response = await this.httpClient.getInstance().post(url, data, config)
    return response.data
  }

  /**
   * POST 请求 - multipart/form-data 格式
   */
  public async postFormData<T = unknown>(
    url: string,
    data: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<BackendApiResponse<T>> {
    const key = this.makeKey(url, data)
    const existing = this.pendingRequests.get(key)
    if (existing) return existing as Promise<BackendApiResponse<T>>

    const formData = new FormData()
    
    // 将对象数据转换为 FormData
    Object.keys(data).forEach(key => {
      const value = data[key]
      if (value !== null && value !== undefined) {
        formData.append(key, String(value))
      }
    })

    const reqPromise = this.httpClient.getInstance().post(url, formData, {
      ...config,
      headers: {
        // 明确删除 Content-Type，让浏览器自动设置 Content-Type 和 boundary
        'Content-Type': undefined,
        ...config?.headers,
      },
    })
    this.pendingRequests.set(key, reqPromise.then(r => r.data).finally(() => { this.pendingRequests.delete(key) }))
    const response = await reqPromise
    return response.data
  }

  /**
   * PUT 请求
   */
  public async put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<BackendApiResponse<T>> {
    const response = await this.httpClient.getInstance().put(url, data, config)
    return response.data
  }

  /**
   * PATCH 请求
   */
  public async patch<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<BackendApiResponse<T>> {
    const response = await this.httpClient.getInstance().patch(url, data, config)
    return response.data
  }

  /**
   * DELETE 请求
   */
  public async delete<T = unknown>(url: string, config?: RequestConfig): Promise<BackendApiResponse<T>> {
    const response = await this.httpClient.getInstance().delete(url, config)
    return response.data
  }

  /**
   * 文件上传
   */
  public async upload<T = unknown>(
    url: string,
    file: File,
    config?: UploadConfig
  ): Promise<BackendApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.httpClient.getInstance().post(url, formData, {
      ...config,
      headers: {
        // 让浏览器自动设置 Content-Type 和 boundary
        'Content-Type': undefined,
        ...config?.headers,
      },
    })

    return response.data
  }

  /**
   * 多文件上传
   */
  public async uploadMultiple<T = unknown>(
    url: string,
    files: File[],
    config?: UploadConfig
  ): Promise<BackendApiResponse<T>> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    const response = await this.httpClient.getInstance().post(url, formData, {
      ...config,
      headers: {
        // 让浏览器自动设置 Content-Type 和 boundary
        'Content-Type': undefined,
        ...config?.headers,
      },
    })

    return response.data
  }

  /**
   * 文件下载
   */
  public async download(url: string, filename?: string, config?: RequestConfig): Promise<void> {
    const response = await this.httpClient.getInstance().get(url, {
      ...config,
      responseType: 'blob',
    })

    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  /**
   * 批量上传附件
   */
  public async uploadBatch(
    files: File[],
    sourceType: 'task' | 'comment' | 'project' | 'document',
    config?: UploadConfig
  ): Promise<BackendApiResponse<UploadedFileData[]>> {
    const formData = new FormData()
    
    // 添加多个文件，使用相同的字段名 'files'
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    // 添加sourceType参数
    formData.append('sourceType', sourceType)

    const response = await this.httpClient.getInstance().post('/attachment/uploadBatch', formData, {
      ...config,
      headers: {
        // 让浏览器自动设置 Content-Type 和 boundary
        'Content-Type': undefined,
        ...config?.headers,
      },
    })

    return response.data
  }

  public async deleteAttachment(
    id: string | number,
    config?: RequestConfig
  ): Promise<BackendApiResponse<null>> {
    return this.get<null>(`/attachment/deleteAttachment/${id}`, {
      ...config,
      skipErrorHandler: true,
    })
  }

  /**
   * 获取原始 axios 实例（用于特殊需求）
   */
  public getAxiosInstance() {
    return this.httpClient.getInstance()
  }
}

// 创建默认实例
const apiClient = new ApiClient()

// 导出默认实例和类
export default apiClient
export { apiClient }
