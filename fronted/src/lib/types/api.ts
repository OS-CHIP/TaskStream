import { AxiosRequestConfig, AxiosProgressEvent } from 'axios'

/**
 * 扩展的请求配置接口
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 跳过认证 token 添加 */
  skipAuth?: boolean
  /** 跳过默认错误处理 */
  skipErrorHandler?: boolean
  /** 显示加载状态 */
  showLoading?: boolean
}

/**
 * 统一的 API 响应格式
 */
export interface ApiResponse<T = unknown> {
  /** 响应数据 */
  data: T
  /** 响应消息 */
  message?: string
  /** 请求是否成功 */
  success: boolean
  /** 响应状态码 */
  code?: number
}

/**
 * 后端统一的 API 响应格式
 * 格式: { code: number, msg: string, data: T }
 */
export interface BackendApiResponse<T = unknown> {
  /** 响应状态码 */
  code: number
  /** 响应消息 */
  msg: string
  /** 响应数据 */
  data: T
}

/**
 * HTTP 客户端配置
 */
export interface HttpClientConfig {
  /** API 基础 URL */
  baseURL?: string
  /** 请求超时时间(毫秒) */
  timeout?: number
  /** 默认请求头 */
  headers?: Record<string, string>
}

/**
 * 文件上传配置
 */
export interface UploadConfig extends RequestConfig {
  /** 上传进度回调 */
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
}

/**
 * 上传文件响应数据
 */
export interface UploadedFileData {
  /** 文件ID */
  id: number
  /** 文件URL */
  url: string
  /** 文件名 */
  fileName: string
  /** 文件大小 */
  fileSize: number
  /** MIME类型 */
  mimeType: string
}

/**
 * 请求元数据
 */
export interface RequestMetadata {
  /** 请求开始时间 */
  startTime: number
}

// 扩展 axios 配置类型
declare module 'axios' {
  interface AxiosRequestConfig {
    /** 请求元数据 */
    metadata?: RequestMetadata
  }
}