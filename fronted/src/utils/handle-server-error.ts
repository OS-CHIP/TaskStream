import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  let errMsg = 'Something went wrong!'

  // 204 特判
  if (error && typeof error === 'object' && 'status' in error && Number((error as { status: unknown }).status) === 204) {
    errMsg = 'Content not found.'
  }

  if (error instanceof AxiosError) {
    const data: unknown = error.response?.data
    const dataObj = data && typeof data === 'object' ? data as Record<string, unknown> : {}
    const title = typeof dataObj.title === 'string' ? dataObj.title.trim() : ''
    const msg = typeof dataObj.msg === 'string' ? dataObj.msg.trim() : ''
    const message = typeof dataObj.message === 'string' ? dataObj.message.trim() : ''
    const fallback = typeof error.message === 'string' ? error.message.trim() : ''
    errMsg = title || msg || message || fallback || errMsg
  }

  // 最终兜底，避免空字符串
  if (!errMsg || (typeof errMsg === 'string' && errMsg.trim() === '')) {
    errMsg = 'Something went wrong!'
  }

  // 稳定 id，避免重复弹相同错误
  toast.error(errMsg, { id: 'global-http-error' })
}
