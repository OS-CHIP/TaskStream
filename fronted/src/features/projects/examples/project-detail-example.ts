/**
 * 项目详情接口对接示例
 * 
 * API信息：
 * - 方法: GET
 * - 路径: /project/queryProjectById/{id}
 * - 请求参数: 项目ID (路径参数)
 * - 返回格式: {code: 200, msg: "ok", data: ProjectDetail}
 */

import { projectsService } from '../services/projects.service'
import { toast } from 'sonner'

/**
 * 获取项目详情示例
 */
export async function getProjectDetailExample() {
  const projectId = '38' // 项目ID

  try {
    // eslint-disable-next-line no-console
    console.log('开始获取项目详情:', projectId)
    
    // 调用获取项目详情接口
    const project = await projectsService.getById(projectId)
    
    // 获取成功处理
    // eslint-disable-next-line no-console
    console.log('项目详情获取成功:', project)
    
    // 显示项目信息
    // eslint-disable-next-line no-console
    console.log('项目名称:', project.name)
    // eslint-disable-next-line no-console
    console.log('项目描述:', project.description)
    // eslint-disable-next-line no-console
    console.log('创建时间:', project.createdAt)
    // eslint-disable-next-line no-console
    console.log('更新时间:', project.updatedAt)
    // eslint-disable-next-line no-console
    console.log('可见性:', project.visibility)
    
    return project
    
  } catch (error: unknown) {
    // 错误处理
    // eslint-disable-next-line no-console
    console.error('获取项目详情失败:', error)
    
    const err = error as { code?: string; message?: string }
    if (err.code === 'NOT_FOUND') {
      toast.error('项目不存在')
    } else {
      // toast.error(err.message || '获取项目详情失败，请稍后重试')
    }
    
    throw error
  }
}

/**
 * 批量获取项目详情示例
 */
export async function batchGetProjectDetailsExample() {
  const projectIds = ['38', '39', '40'] // 项目ID列表
  const results: Array<{id: string, success: boolean, project?: unknown, error?: string}> = []

  for (const projectId of projectIds) {
    try {
      const project = await projectsService.getById(projectId)
      results.push({ id: projectId, success: true, project })
      // eslint-disable-next-line no-console
      console.log(`项目 ${projectId} 详情获取成功`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      results.push({ 
        id: projectId, 
        success: false, 
        error: err.message || '未知错误'
      })
      // eslint-disable-next-line no-console
      console.error(`项目 ${projectId} 详情获取失败:`, error)
    }
  }

  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  // eslint-disable-next-line no-console
  console.log(`批量获取完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  
  if (failCount === 0) {
    toast.success(`成功获取 ${successCount} 个项目详情`)
  } else {
    toast.error(`获取完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  }

  return results
}

/**
 * 项目详情页面加载示例
 */
export async function loadProjectDetailPageExample() {
  const projectId = '38'

  try {
    // 显示加载状态
    // eslint-disable-next-line no-console
    console.log('正在加载项目详情...')
    
    // 获取项目详情
    const project = await projectsService.getById(projectId)
    
    // 构建页面数据
    const pageData = {
      project,
      breadcrumb: [
        { label: '项目管理', href: '/projects' },
        { label: project.name, href: `/projects/${project.id}` }
      ],
      tabs: [
        { id: 'overview', label: '概览', active: true },
        { id: 'tasks', label: '任务' },
        { id: 'members', label: '成员' },
        { id: 'settings', label: '设置' }
      ]
    }
    
    // eslint-disable-next-line no-console
    console.log('项目详情页面数据:', pageData)
    return pageData
    
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string }
    // eslint-disable-next-line no-console
    console.error('加载项目详情页面失败:', error)
    
    if (err.code === 'NOT_FOUND') {
      // 项目不存在，重定向到404页面或项目列表
      // eslint-disable-next-line no-console
      console.log('项目不存在，重定向到项目列表')
      // window.location.href = '/projects'
    } else {
      toast.error('加载项目详情失败，请稍后重试')
    }
    
    throw error
  }
}

/**
 * 项目详情缓存示例
 */
export async function cachedProjectDetailExample() {
  const projectId = '38'
  const cacheKey = `project_detail_${projectId}`
  
  try {
    // 1. 尝试从缓存获取
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const cachedData = JSON.parse(cached)
      const cacheTime = new Date(cachedData.timestamp)
      const now = new Date()
      const diffMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60)
      
      // 缓存5分钟内有效
      if (diffMinutes < 5) {
        // eslint-disable-next-line no-console
        console.log('使用缓存的项目详情:', cachedData.project)
        return cachedData.project
      }
    }
    
    // 2. 从API获取最新数据
    const project = await projectsService.getById(projectId)
    
    // 3. 更新缓存
    const cacheData = {
      project,
      timestamp: new Date().toISOString()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    
    // eslint-disable-next-line no-console
    console.log('获取并缓存项目详情:', project)
    return project
    
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('获取项目详情失败:', error)
    
    // 如果API失败，尝试使用过期缓存
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      const cachedData = JSON.parse(cached)
      // eslint-disable-next-line no-console
      console.log('API失败，使用过期缓存:', cachedData.project)
      toast.warning('使用缓存数据，可能不是最新信息')
      return cachedData.project
    }
    
    throw error
  }
}

/**
 * React组件中使用项目详情的示例
 */
export const ProjectDetailComponent = `
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { projectsService } from '../services/projects.service'
import { toast } from 'sonner'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    const loadProject = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const projectData = await projectsService.getById(id)
        setProject(projectData)
        
      } catch (err: unknown) {
        const error = err as { message?: string; code?: string }
        // eslint-disable-next-line no-console
        console.error('加载项目详情失败:', error)
        setError(error?.message || '加载项目详情失败')
        
        if (error?.code === 'NOT_FOUND') {
          toast.error('项目不存在')
          // 可以重定向到项目列表
          // navigate('/projects')
        } else {
          toast.error('加载项目详情失败，请稍后重试')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>正在加载项目详情...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>项目不存在</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* 面包屑导航 */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm">
          <li><a href="/projects" className="text-blue-600 hover:underline">项目管理</a></li>
          <li className="text-gray-500">/</li>
          <li className="text-gray-900">{project.name}</li>
        </ol>
      </nav>

      {/* 项目头部信息 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600 mb-4">{project.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>创建时间: {new Date(project.createdAt).toLocaleString()}</span>
              <span>更新时间: {new Date(project.updatedAt).toLocaleString()}</span>
              <span>可见性: {project.visibility === 'private' ? '私有' : '公开'}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              编辑项目
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              删除项目
            </button>
          </div>
        </div>
      </div>

      {/* 项目内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* 主要内容区域 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">项目概览</h2>
            {/* 项目统计、最近活动等内容 */}
          </div>
        </div>
        <div>
          {/* 侧边栏 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">项目信息</h3>
            {/* 项目成员、设置等内容 */}
          </div>
        </div>
      </div>
    </div>
  )
}
`