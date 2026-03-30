import { apiClient } from '@/lib/api-client'

export interface FlatProjectRecord {
  id: number
  projectName: string
  description?: string | null
  status: string
  createTime?: string
  updateTime?: string
}

export interface ProjectRelation {
  id: number
  parentProjectId: number
  childProjectId: number
  relationType?: string
  createTime?: string
  isDeleted?: string | number
}

export interface ProjectsWithRelationsResponse {
  projects: FlatProjectRecord[]
  relations: ProjectRelation[]
}

export const projectRelationsService = {
  async getProjectsWithRelations(projectId: string): Promise<ProjectsWithRelationsResponse> {
    const response = await apiClient.get<ProjectsWithRelationsResponse>(`/project/getProjectsWithRelations/${projectId}`)
    if (response.code !== 200) {
      throw new Error(response.msg || '获取项目关系数据失败')
    }
    return response.data || { projects: [], relations: [] }
  },
  async queryProjectTree(): Promise<any> {
    const response = await apiClient.get<any>('/project/queryProjectTree', { skipErrorHandler: true })
    const ok = response.code === 200 || response.code === 0
    if (!ok) {
      throw new Error(response.msg || '获取项目树失败')
    }
    let data = (response.data ?? (response as any).data) as any
    if (typeof data === 'string') {
      try { data = JSON.parse(data) } catch { /* keep string */ }
    }
    return data
  },
}
