import { apiClient } from '@/lib/api-client'

export type DashboardStats = {
  totalProjects: number
  pending: number
  inProgress: number
  completed: number
  canceled: number
  blocked: number
  overdue: number
}

export type TrendItem = {
  date: string
  count: number
}

export type WorkHoursItem = {
  date: string
  hours: number
}

export type GetDashboardResponse = {
  code: number
  msg: string
  data: {
    stats: DashboardStats
    createTrend: TrendItem[]
    completeTrend: TrendItem[]
    workHours: WorkHoursItem[]
  }
}

export async function getDashboard(params: {
  startTime: string
  dueTime: string
  projectId: string | number
}) {
  const formData: Record<string, unknown> = {
    startTime: params.startTime,
    dueTime: params.dueTime,
    projectId: params.projectId,
  }
  return apiClient.postFormData<GetDashboardResponse>('/dashboard/getDashboard', formData)
}
