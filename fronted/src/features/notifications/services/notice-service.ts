import { apiClient } from '@/lib/api-client'
import type { BackendApiResponse, RequestConfig } from '@/lib/types/api'

export type NoticeType = 0 | 1
export type TargetType = 0 | 1

export interface QueryMyNoticeRequest {
  page?: string
  size?: string
  type?: 1 | 2
  isRead?: boolean
}

export interface NoticeItem {
  id: number
  type: 1 | 2
  title: string
  summary: string | null
  jumpUrl: string | null
  isRead: boolean
  createTime: string
}

export interface QueryMyNoticeResponse {
  list: NoticeItem[]
  hasNext: boolean
}

export interface UnreadCountData {
  total: number
  system: number
  event: number
}

/**
 * 系统通知发送入参
 * - `title` 与 `content` 必填
 * - `noticeType`: 0=公告, 1=活动
 * - `targetType`: 0=全体, 1=指定用户
 * - 当 `targetType=1` 时需提供 `targetUserId`，支持 `string` 或 `number[]`
 */
export interface SendSystemNoticeParams {
  title: string
  content: string
  noticeType: NoticeType
  targetType: TargetType
  targetUserId?: string | number[]
}

/**
 * 规范化目标用户ID
 * - 数组形式转换为逗号分隔字符串
 * - 字符串原样透传
 */
const normalizeTargetUserIds = (ids?: string | number[]) => {
  if (!ids) return undefined
  if (Array.isArray(ids)) return ids.join(',')
  return ids
}

/**
 * 发送系统通知到后端接口 `/notice/send`
 * - 默认使用 JSON 提交，自动走全局 axios 封装与认证拦截
 * - 全体通知：仅发送 `title/content/noticeType/targetType`
 * - 指定用户通知：额外发送 `targetUserId`（自动数组转字符串）
 * - 可通过 `config` 控制认证与错误处理（如 `skipAuth`, `skipErrorHandler`）
 *
 * 示例：
 * ```ts
 * await sendSystemNotice({
 *   title: '系统公告',
 *   content: '内容...',
 *   noticeType: 0,
 *   targetType: 0,
 * })
 * ```
 */
export async function sendSystemNotice(
  params: SendSystemNoticeParams,
  config?: RequestConfig
): Promise<BackendApiResponse<null>> {
  const payload: Record<string, unknown> = {
    title: params.title,
    content: params.content,
    noticeType: params.noticeType,
    targetType: params.targetType,
  }
  if (params.targetType === 1) {
    payload.targetUserId = normalizeTargetUserIds(params.targetUserId)
  }
  return apiClient.post<null>('/notice/send', payload, config)
}

export async function queryMyNotices(
  params: QueryMyNoticeRequest = {},
  config?: RequestConfig
): Promise<QueryMyNoticeResponse> {
  const requestParams: Record<string, string> = {
    page: params.page || '1',
    size: params.size || '10',
  }
  if (params.type) requestParams.type = String(params.type)
  if (params.isRead !== undefined) {
    requestParams.isRead = String(params.isRead)
  }
  const response = await apiClient.get<QueryMyNoticeResponse>('/notice/list', {
    ...config,
    params: requestParams,
  })
  if (response.code !== 200) {
    throw new Error(response.msg || '查询通知失败')
  }
  return response.data
}
export async function markAllRead(config?: RequestConfig): Promise<string> {
  const response = await apiClient.get<string>('/notice/markAllRead', config)
  if (response.code !== 200 && response.code !== 0) {
    throw new Error(response.msg || '标记全部通知为已读失败')
  }
  return response.data
}

export async function markRead(id: number, type: 1 | 2, config?: RequestConfig): Promise<string | null> {
  const response = await apiClient.post<string | null>('/notice/markRead', { id, type }, config)
  if (response.code !== 200 && response.code !== 0) {
    throw new Error(response.msg || '标记通知为已读失败')
  }
  return response.data
}

/**
 * 获取未读数量（用于红点提示）
 * GET `/notice/unreadCount`
 */
export async function unreadCount(config?: RequestConfig): Promise<UnreadCountData> {
  const response = await apiClient.get<UnreadCountData>('/notice/unreadCount', config)
  if (response.code !== 200 && response.code !== 0) {
    throw new Error(response.msg || '获取未读数量失败')
  }
  return response.data
}

let unreadInitPromise: Promise<UnreadCountData> | null = null
let unreadCache: UnreadCountData | null = null
let unreadFetched = false
export async function unreadCountInitOnce(config?: RequestConfig): Promise<UnreadCountData> {
  if (unreadFetched && unreadCache) return unreadCache
  if (unreadInitPromise) return unreadInitPromise
  unreadInitPromise = unreadCount(config).then((data) => {
    unreadCache = data
    unreadFetched = true
    return data
  }).finally(() => {
    unreadInitPromise = null
  })
  return unreadInitPromise
}

export function setUnreadCached(total?: number) {
  const t = typeof total === 'number' ? total : (unreadCache?.total ?? 0)
  unreadCache = { total: t, system: unreadCache?.system ?? 0, event: unreadCache?.event ?? 0 }
  unreadFetched = true
}

export function getUnreadCached(): UnreadCountData | null {
  return unreadCache
}

export const noticeService = {
  sendSystemNotice,
  queryMyNotices,
  markAllRead,
  markRead,
  unreadCount,
  unreadCountInitOnce,
  setUnreadCached,
  getUnreadCached,
}
