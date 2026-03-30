import { AxiosError } from 'axios'
import { toast } from 'sonner'
import i18n from '@/lib/i18n'

/**
 * 错误类型枚举
 */
export enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  PERMISSION = 'permission',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  UNKNOWN = 'unknown'
}

/**
 * 错误信息接口
 */
export interface ErrorInfo {
  type: ErrorType
  message: string
  code?: number
  details?: unknown
}

/**
 * 解析错误信息
 * @param error 错误对象
 * @returns 解析后的错误信息
 */
export function parseError(error: unknown): ErrorInfo {
  // 默认错误信息
  const errorInfo: ErrorInfo = {
    type: ErrorType.UNKNOWN,
    message: i18n.t('common.error.unknown', { defaultValue: '未知错误' })
  }

  // 处理 AxiosError
  if (error instanceof AxiosError) {
    const status = error.response?.status
    const data = error.response?.data
    
    // 根据状态码分类错误
    switch (status) {
      case 400:
        errorInfo.type = ErrorType.VALIDATION
        errorInfo.message = i18n.t('common.error.validation', { defaultValue: '请求参数错误' })
        break
      case 401:
        errorInfo.type = ErrorType.PERMISSION
        errorInfo.message = i18n.t('common.error.unauthorized', { defaultValue: '未授权访问' })
        break
      case 403:
        errorInfo.type = ErrorType.PERMISSION
        errorInfo.message = i18n.t('common.error.forbidden', { defaultValue: '权限不足' })
        break
      case 404:
        errorInfo.type = ErrorType.NOT_FOUND
        errorInfo.message = i18n.t('common.error.notFound', { defaultValue: '资源未找到' })
        break
      case 500:
        errorInfo.type = ErrorType.SERVER
        errorInfo.message = i18n.t('common.error.server', { defaultValue: '服务器内部错误' })
        break
      default:
        if (status && status >= 500) {
          errorInfo.type = ErrorType.SERVER
          errorInfo.message = i18n.t('common.error.server', { defaultValue: '服务器错误' })
        } else if (status && status >= 400) {
          errorInfo.type = ErrorType.VALIDATION
          errorInfo.message = i18n.t('common.error.client', { defaultValue: '请求错误' })
        } else {
          errorInfo.type = ErrorType.NETWORK
          errorInfo.message = i18n.t('common.error.network', { defaultValue: '网络连接错误' })
        }
    }

    // 尝试从响应中获取具体错误信息
    if (data) {
      const serverMessage = data.msg || data.message || data.error
      if (serverMessage && typeof serverMessage === 'string') {
        errorInfo.message = serverMessage
      }
    }

    errorInfo.code = status
    errorInfo.details = data
  }
  // 处理网络错误
  else if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('timeout')) {
      errorInfo.type = ErrorType.NETWORK
      errorInfo.message = i18n.t('common.error.network', { defaultValue: '网络连接超时' })
    } else {
      errorInfo.message = error.message
    }
  }
  // 处理字符串错误
  else if (typeof error === 'string') {
    errorInfo.message = error
  }

  return errorInfo
}

/**
 * 显示错误提示
 * @param error 错误对象
 * @param options 显示选项
 */
export function showError(
  error: unknown, 
  options: {
    id?: string
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  } = {}
) {
  const errorInfo = parseError(error)
  
  const toastOptions: {
    id: string
    duration: number
    action?: {
      label: string
      onClick: () => void
    }
  } = {
    id: options.id || `error-${errorInfo.type}`,
    duration: options.duration || 5000
  }

  // 添加重试按钮
  if (options.action) {
    toastOptions.action = {
      label: options.action.label,
      onClick: options.action.onClick
    }
  }

  toast.error(errorInfo.message, toastOptions)
  
  // 在开发环境下打印详细错误信息
  if (import.meta.env.DEV) {
    // Error details logged for debugging
  }
}

/**
 * 显示成功提示
 * @param message 成功信息
 * @param options 显示选项
 */
export function showSuccess(
  message: string,
  options: {
    id?: string
    duration?: number
  } = {}
) {
  toast.success(message, {
    id: options.id,
    duration: options.duration || 3000
  })
}

/**
 * 显示警告提示
 * @param message 警告信息
 * @param options 显示选项
 */
export function showWarning(
  message: string,
  options: {
    id?: string
    duration?: number
  } = {}
) {
  toast.warning(message, {
    id: options.id,
    duration: options.duration || 4000
  })
}

/**
 * 显示信息提示
 * @param message 信息内容
 * @param options 显示选项
 */
export function showInfo(
  message: string,
  options: {
    id?: string
    duration?: number
  } = {}
) {
  toast.info(message, {
    id: options.id,
    duration: options.duration || 3000
  })
}

/**
 * 显示加载提示
 * @param message 加载信息
 * @param options 显示选项
 */
export function showLoading(
  message: string,
  options: {
    id?: string
  } = {}
) {
  return toast.loading(message, {
    id: options.id
  })
}

/**
 * 关闭指定的提示
 * @param id 提示ID
 */
export function dismissToast(id: string) {
  toast.dismiss(id)
}

/**
 * 关闭所有提示
 */
export function dismissAllToasts() {
  toast.dismiss()
}