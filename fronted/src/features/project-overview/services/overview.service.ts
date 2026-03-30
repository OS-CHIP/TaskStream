import { apiClient } from '@/lib/api-client'

export type ProjectOverviewStatusItem = {
  status: string | null
  count: number
  percent: number
}

export type ProjectOverviewPriorityItem = {
  level: string
  count: number
}

export type ProjectOverviewTaskStatics = {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
}

export type ProjectOverviewResponse = {
  code: number
  msg: string
  data: {
    taskStatics: ProjectOverviewTaskStatics
    status: ProjectOverviewStatusItem[]
    priority: ProjectOverviewPriorityItem[]
  }
}

export async function getProjectOverview(projectId: string | number): Promise<ProjectOverviewResponse['data']> {
  const res = await apiClient.get<ProjectOverviewResponse['data']>(`/projectOverview/overview/${projectId}`)
  return res.data
}
