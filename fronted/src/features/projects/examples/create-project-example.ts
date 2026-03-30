/**
 * 项目创建接口对接示例
 * 
 * 接口信息：
 * - 方法: POST
 * - 路径: /project/addProject
 * - 请求体: { projectName: string, description?: string, status: string }
 * - 响应: { id: string, projectName: string, key: string, description?: string, status: string, createdAt: string, updatedAt: string }
 */

import { projectsService } from '../services/projects.service'

// 创建项目示例
export async function createProjectExample() {
  try {
    // 示例1: 创建可见项目
    const visibleProject = await projectsService.create({
      projectName: '项目名111111',
      description: '描述',
      status: '1' // 1-可见, 0-不可见
    })
    
    // eslint-disable-next-line no-console
    console.log('创建可见项目成功:', visibleProject)
    
    // 示例2: 创建不可见项目
    const hiddenProject = await projectsService.create({
      projectName: '隐藏项目',
      description: '这是一个隐藏项目',
      status: '0'
    })
    
    // eslint-disable-next-line no-console
    console.log('创建隐藏项目成功:', hiddenProject)
    
    return { visibleProject, hiddenProject }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('创建项目失败:', error)
    throw error
  }
}

// 表单验证示例
export function validateProjectForm(data: {
  projectName: string
  description?: string
  status: string
}) {
  const errors: Record<string, string> = {}
  
  // 项目名称验证
  if (!data.projectName || data.projectName.trim().length < 2) {
    errors.projectName = '项目名称至少需要2个字符'
  }
  
  if (data.projectName && data.projectName.length > 64) {
    errors.projectName = '项目名称不能超过64个字符'
  }
  
  // 描述验证
  if (data.description && data.description.length > 280) {
    errors.description = '项目描述不能超过280个字符'
  }
  
  // 状态验证
  if (!['0', '1'].includes(data.status)) {
    errors.status = '项目状态必须是0（不可见）或1（可见）'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// 业务逻辑增强示例
export class ProjectManager {
  /**
   * 创建项目并初始化相关资源
   */
  static async createProjectWithSetup(projectData: {
    projectName: string
    description?: string
    status: string
  }) {
    // 1. 验证数据
    const validation = validateProjectForm(projectData)
    if (!validation.isValid) {
      throw new Error(`表单验证失败: ${Object.values(validation.errors).join(', ')}`)
    }
    
    try {
      // 2. 创建项目
      const project = await projectsService.create(projectData)
      
      // 3. 初始化项目相关资源（示例）
      await this.initializeProjectResources(project.id)
      
      // 4. 记录操作日志
      // eslint-disable-next-line no-console
      console.log(`项目创建成功: ${project.name} (ID: ${project.id})`)
      
      return project
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('项目创建失败:', error)
      throw new Error('项目创建失败，请稍后重试')
    }
  }
  
  /**
   * 初始化项目资源（示例）
   */
  private static async initializeProjectResources(projectId: string) {
    // 这里可以添加项目初始化逻辑，比如：
    // - 创建默认文件夹结构
    // - 设置默认权限
    // - 创建初始任务
    // - 发送通知等
    
    // eslint-disable-next-line no-console
    console.log(`初始化项目资源: ${projectId}`)
    
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  /**
   * 批量创建项目
   */
  static async createMultipleProjects(projectsData: Array<{
    projectName: string
    description?: string
    status: string
  }>) {
    const results = []
    const errors = []
    
    for (const projectData of projectsData) {
      try {
        const project = await this.createProjectWithSetup(projectData)
        results.push(project)
      } catch (error) {
        errors.push({
          projectName: projectData.projectName,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }
    
    return { results, errors }
  }
}