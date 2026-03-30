import { apiClient } from '@/lib/api-client'

export type MemberTaskItem = {
  taskTitle: string
  status: number
  priority: number
}

export type MemberTaskStatics = {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
}

export type ProjectMemberTasksItem = {
  userName: string
  taskStatics: MemberTaskStatics
  memberTasks: MemberTaskItem[]
}

export type ProjectMemberTasksResponse = {
  code: number
  msg: string
  data: ProjectMemberTasksItem[]
}

export async function getProjectMemberTasksInfo(projectId: string | number): Promise<ProjectMemberTasksItem[]> {
  const res = await apiClient.get<ProjectMemberTasksResponse['data']>(`/projectOverview/getMemberInfos/${projectId}`)
  return res.data
}
