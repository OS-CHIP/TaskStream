import { apiClient } from '@/lib/api-client'

export interface GanttApiItem {
  id: number
  taskCode?: string
  taskTitle: string
  taskTypeId?: number
  tags?: string
  projectId: number
  description?: string
  priority?: string
  assigner?: string | number | null
  dueDate?: string | null
  assignee?: string | number | null
  estimatedHours?: number
  status?: string
  completionPercentage?: string | number
  startTime?: string | null
  isDeleted?: number | string
  [key: string]: unknown
}

export async function getGanttData(projectId?: string, startTime?: string, dueTime?: string): Promise<GanttApiItem[]> {
  const pid = projectId || (localStorage.getItem('selected_project_id') || '')
  const formData: Record<string, any> = {}
  if (pid) {
    const n = Number(pid)
    if (!Number.isNaN(n) && n > 0) {
      formData.projectId = n
    } else {
      formData.projectId = pid
    }
  }
  const normalizedStart = startTime ? ensureDateTime(startTime, 'start') : undefined
  const normalizedDue = dueTime ? ensureDateTime(dueTime, 'end') : undefined
  if (normalizedStart) formData.startTime = normalizedStart
  if (normalizedDue) formData.dueTime = normalizedDue
  const res = await apiClient.postFormData<GanttApiItem[]>('/task/getGanttData', formData)
  if ((res as any).code && (res as any).code !== 200) {
    throw new Error((res as any).msg || '获取甘特数据失败')
  }
  const data = (res as any).data ?? res
  return Array.isArray(data) ? data : []
}

export function parseDateTime(input?: string | null): Date | null {
  if (!input) return null
  const s = String(input).trim()
  if (!s) return null
  const normalized = s.replace(' ', 'T')
  const d = new Date(normalized)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDateTimeLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatDateLocal(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function ensureDateTime(input: string, boundary: 'start' | 'end'): string {
  const s = String(input).trim()
  if (!s) return s
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return `${s} ${boundary === 'start' ? '00:00:00' : '23:59:59'}`
  }
  return s
}
