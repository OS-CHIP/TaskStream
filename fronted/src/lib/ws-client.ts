import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'
import { getCookie } from '@/utils/cookie'

let socket: WebSocket | null = null
let reconnectAttempts = 0
let isConnecting = false
let heartbeatTimer: number | null = null

function getToken(): string | null {
  const storeToken = useAuthStore.getState().auth.accessToken as string | undefined
  const cookieToken = getCookie('token')
  return storeToken || cookieToken || null
}

function buildWsUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin
  let origin: URL
  try {
    origin = new URL(base, window.location.origin)
  } catch {
    origin = new URL(window.location.origin)
  }
  const protocol = origin.protocol === 'https:' ? 'wss:' : 'ws:'
  const host = origin.host
  const path = '/ws'
  const token = getToken()
  const qs = token ? `?token=${encodeURIComponent(token)}` : ''
  return `${protocol}//${host}${path}${qs}`
}

function scheduleReconnect() {
  reconnectAttempts = Math.min(reconnectAttempts + 1, 6)
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 15000)
  setTimeout(() => initWebSocket(), delay)
}

function startHeartbeat() {
  if (heartbeatTimer) return
  heartbeatTimer = window.setInterval(() => {
    try {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ cmd: 'ping' }))
      }
    } catch {}
  }, 25000)
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function handleMessage(ev: MessageEvent) {
  let payload: any = null
  try {
    payload = JSON.parse(ev.data)
  } catch {
    payload = { message: String(ev.data) }
  }
  const raw = typeof ev.data === 'string' ? ev.data : ''
  const rawText = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  const isPong =
    rawText === 'pong' ||
    (payload &&
      (['cmd', 'type', 'event', 'message'].some((k) => String(payload?.[k] ?? '').toLowerCase() === 'pong') ||
        (payload?.data &&
          ['cmd', 'type', 'event', 'message'].some(
            (k) => String(payload?.data?.[k] ?? '').toLowerCase() === 'pong'
          ))))
  if (isPong) return
  const typeRaw =
    payload?.type ??
    (payload?.data && (payload.data.type ?? payload.data.kind ?? payload.data.category))
  const typeNum =
    typeof typeRaw === 'number'
      ? typeRaw
      : typeof typeRaw === 'string' && /^\d+$/.test(typeRaw)
      ? Number(typeRaw)
      : undefined
  const isSystem = String(typeRaw).toLowerCase() === 'system' || typeNum === 1
  const isEvent = typeNum === 2
  const typeLabel = isSystem ? '系统消息' : isEvent ? '事件通知' : undefined
  const title = payload.title || typeLabel || '新消息提醒'
  const description = (() => {
    if (typeof payload?.data === 'string') return payload.data
    return (
      payload.content ||
      payload.message ||
      (payload.data && (payload.data.msg || payload.data.message || payload.data.content)) ||
      payload.msg ||
      ''
    )
  })()

  toast.info(title, {
    description,
    action: {
      label: '查看',
      onClick: () => {
        try {
          const r = (window as any).appRouter
          if (r?.navigate) {
            r.navigate({ to: '/messages' })
          } else {
            window.history.pushState(null, '', '/messages')
          }
        } catch {}
      },
    },
  })

  const unreadCount =
    (typeof payload?.unreadCount === 'number' ? payload.unreadCount : undefined) ??
    (typeof payload?.data?.unreadCount === 'number' ? payload.data.unreadCount : undefined) ??
    (typeof payload?.total === 'number' ? payload.total : undefined) ??
    (typeof payload?.count === 'number' ? payload.count : undefined)
  window.dispatchEvent(new CustomEvent('messages:update', { detail: { unreadCount } }))
}

export function initWebSocket() {
  if (isConnecting) return
  isConnecting = true

  const url = buildWsUrl()
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    isConnecting = false
    return
  }
  try {
    socket?.close()
  } catch {}
  stopHeartbeat()

  socket = new WebSocket(url)
  socket.onopen = () => {
    isConnecting = false
    reconnectAttempts = 0
    startHeartbeat()
  }
  socket.onmessage = handleMessage
  socket.onerror = () => {
    isConnecting = false
  }
  socket.onclose = () => {
    isConnecting = false
    stopHeartbeat()
    scheduleReconnect()
  }
}

export function closeWebSocket() {
  try {
    socket?.close()
  } catch {}
  socket = null
  isConnecting = false
  stopHeartbeat()
}

export function getWebSocket(): WebSocket | null {
  return socket
}
