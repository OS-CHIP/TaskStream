import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import type { HttpClientConfig, RequestConfig } from './types/api'

/**
 * HTTP 客户端核心类
 * 负责 axios 实例管理和拦截器逻辑
 */
export class HttpClient {
  private instance: AxiosInstance

  constructor(config?: HttpClientConfig) {
    // 创建 axios 实例
    this.instance = axios.create({
      baseURL: config?.baseURL || import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: config?.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers,
      },
    })

    // 设置拦截器
    this.setupInterceptors()
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => this.handleRequest(config),
      (error: AxiosError) => this.handleRequestError(error)
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => this.handleResponse(response),
      (error: AxiosError) => this.handleResponseError(error)
    )
  }

  /**
   * 处理请求拦截
   */
  private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
    // 添加请求时间戳
    config.metadata = { startTime: Date.now() }

    // 添加认证 token
    const requestConfig = config as RequestConfig
    if (!requestConfig.skipAuth) {
      const { accessToken } = useAuthStore.getState().auth
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    // 开发环境下记录请求日志
    if (import.meta.env.DEV) {
      // console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
      //   data: config.data,
      //   params: config.params,
      // })
    }

    // 若为 FormData，移除 JSON Content-Type，交给浏览器自动设置 boundary
    if (config.data instanceof FormData) {
      try {
        const h = config.headers as Record<string, unknown>
        if (typeof h.delete === 'function') {
          h.delete('Content-Type')
          h.delete('content-type')
        } else {
          delete h['Content-Type']
          delete h['content-type']
        }
      } catch {
        // Ignore header deletion errors
      }
    }
    return config
  }

  /**
   * 处理请求错误
   */
  private handleRequestError(error: AxiosError): Promise<never> {
    // console.error('❌ 请求配置错误:', error)
    return Promise.reject(error)
  }

  /**
   * 处理响应拦截
   */
  private handleResponse(response: AxiosResponse): AxiosResponse {
    // 开发环境下记录响应日志
    if (import.meta.env.DEV) {
      // const { config } = response
      // const _duration = config.metadata ? Date.now() - config.metadata.startTime : 0
      // console.log(
      //   `✅ [${config.method?.toUpperCase()}] ${config.url} - ${_duration}ms`,
      //   response.data
      // )
    }
    
    // 检查业务状态码
    if (response.data?.code !== 200) {
      this.handleBusinessError(response)
    }
    
    return response
  }

  /**
   * 处理业务错误（当响应成功但业务状态码不为200时）
   */
  private handleBusinessError(response: AxiosResponse): void {
    const { config, data } = response
    
    // 开发环境下记录业务错误日志
    if (import.meta.env.DEV) {
      console.warn(
        `⚠️ 业务错误 [${config?.method?.toUpperCase()}] ${config?.url}`,
        { code: data?.code, message: data?.msg || data?.message }
      )
    }

    // 处理 401 认证失效
    if (data?.code == 401) {
      const { reset } = useAuthStore.getState().auth
      reset()
      // 清除 Cookie 和缓存并跳转登录页
      if (typeof window !== 'undefined') {
        try {
          // 删除 token cookie
          document.cookie = 'token=; Max-Age=0; path=/'
          // 尝试清理同域下所有可见 cookie（防止使用了不同键名）
          document.cookie.split(';').forEach((c) => {
            const eqPos = c.indexOf('=')
            const name = (eqPos > -1 ? c.substring(0, eqPos) : c).trim()
            if (name) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            }
          })
        } catch {
          // Ignore cookie clearing errors
        }
        try { localStorage.clear() } catch {
          // Ignore localStorage clearing errors
        }
        try { sessionStorage.clear() } catch {
          // Ignore sessionStorage clearing errors
        }
        if ('caches' in window) {
          void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        }
        window.location.href = '/sign-in'
      }
      return
    }

    // 跳过错误处理
    if ((config as RequestConfig)?.skipErrorHandler) {
      return
    }

    // 创建一个模拟的 AxiosError 来复用现有的错误处理逻辑
    const businessError = new Error(data?.msg || data?.message || '业务处理失败') as AxiosError
    businessError.config = config
    businessError.response = response
    businessError.isAxiosError = true
    businessError.name = 'BusinessError'

    // 使用现有的错误处理函数
    handleServerError(businessError)
  }

  /**
   * 处理响应错误
   */
  private handleResponseError(error: AxiosError): Promise<never> {
    const { config, response } = error

    // 开发环境下记录错误日志
    if (import.meta.env.DEV) {
      // const _duration = config?.metadata ? Date.now() - config.metadata.startTime : 0
      // console.error(
      //   `❌ [${config?.method?.toUpperCase()}] ${config?.url} - ${_duration}ms`,
      //   error.message
      // )
    }

    // 请求被取消时，静默跳过全局错误处理
    const isCanceled = (error as AxiosError & { code?: string; name?: string })?.code === 'ERR_CANCELED' || 
                      (error as AxiosError & { code?: string; name?: string })?.name === 'CanceledError' || 
                      error.message === 'canceled'
    if (isCanceled) {
      return Promise.reject(error)
    }
    // 处理 401 认证失效
    if (response?.data && typeof response.data === 'object' && 'code' in response.data && (response.data as any).code == 401) {
      const { reset } = useAuthStore.getState().auth
      reset()
      // 清除 Cookie 和缓存并跳转登录页
      if (typeof window !== 'undefined') {
        try {
          // 删除 token cookie
          document.cookie = 'token=; Max-Age=0; path=/'
          // 尝试清理同域下所有可见 cookie（防止使用了不同键名）
          document.cookie.split(';').forEach((c) => {
            const eqPos = c.indexOf('=')
            const name = (eqPos > -1 ? c.substring(0, eqPos) : c).trim()
            if (name) {
              document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
            }
          })
        } catch {
          // Ignore cookie clearing errors
        }
        try { localStorage.clear() } catch {
          // Ignore localStorage clearing errors
        }
        try { sessionStorage.clear() } catch {
          // Ignore sessionStorage clearing errors
        }
        if ('caches' in window) {
          void caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        }
        window.location.href = '/sign-in'
      }
    }

    // 跳过错误处理
    if ((config as RequestConfig)?.skipErrorHandler) {
      return Promise.reject(error)
    }

    // 使用现有的错误处理函数
    handleServerError(error)

    return Promise.reject(error)
  }

  /**
   * 获取 axios 实例
   */
  public getInstance(): AxiosInstance {
    return this.instance
  }
}