/**
 * 项目切换器模拟数据
 * 
 * @description 提供项目列表的模拟数据，便于开发和演示
 * @author SOLO Document
 * @created 2024-01-20
 */

import type { Project } from '../project-switcher/types'

/**
 * 模拟项目数据列表
 * 
 * @description 包含不同状态、不同长度名称的代表性项目数据
 * 便于测试各种UI场景和搜索功能
 */
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-001',
    name: 'ShadCN Admin Dashboard',
    description: '基于React和ShadCN UI的现代化管理后台系统',
    avatar: '🚀',
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'proj-002', 
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce solution with React and Node.js',
    avatar: '🛒',
    status: 'active',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'proj-003',
    name: '移动端App开发',
    description: '跨平台移动应用开发项目，支持iOS和Android',
    avatar: '📱',
    status: 'active',
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'proj-004',
    name: 'AI Chat Bot',
    description: 'Intelligent chatbot powered by OpenAI GPT',
    avatar: '🤖',
    status: 'active',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'proj-005',
    name: 'Data Analytics Dashboard',
    description: 'Real-time data visualization and analytics platform',
    avatar: '📊',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'proj-006',
    name: 'Legacy CRM System',
    description: '旧版客户关系管理系统，已停止维护',
    avatar: '📋',
    status: 'archived',
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2023-12-31')
  },
  {
    id: 'proj-007',
    name: 'Microservices Architecture',
    description: 'Distributed system with Docker and Kubernetes',
    avatar: '🏗️',
    status: 'active',
    createdAt: new Date('2023-12-15'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'proj-008',
    name: 'Prototype Testing',
    description: '原型测试项目，用于验证新技术方案',
    avatar: '🧪',
    status: 'archived',
    createdAt: new Date('2023-11-20'),
    updatedAt: new Date('2023-12-20')
  }
]

/**
 * 获取所有项目数据
 * 
 * @returns 项目列表
 */
export function getAllProjects(): Project[] {
  return MOCK_PROJECTS
}

/**
 * 获取活跃状态的项目
 * 
 * @returns 活跃项目列表
 */
export function getActiveProjects(): Project[] {
  return MOCK_PROJECTS.filter(project => project.status === 'active')
}

/**
 * 获取已归档的项目
 * 
 * @returns 已归档项目列表
 */
export function getArchivedProjects(): Project[] {
  return MOCK_PROJECTS.filter(project => project.status === 'archived')
}

/**
 * 根据ID查找项目
 * 
 * @param id 项目ID
 * @returns 项目数据或undefined
 */
export function getProjectById(id: string): Project | undefined {
  return MOCK_PROJECTS.find(project => project.id === id)
}

/**
 * 获取默认项目（第一个活跃项目）
 * 
 * @returns 默认项目或undefined
 */
export function getDefaultProject(): Project | undefined {
  const activeProjects = getActiveProjects()
  return activeProjects.length > 0 ? activeProjects[0] : MOCK_PROJECTS[0]
}

/**
 * 搜索项目
 * 
 * @param searchValue 搜索关键词
 * @param projects 项目列表（可选，默认为所有项目）
 * @returns 匹配的项目列表
 */
export function searchProjects(
  searchValue: string, 
  projects: Project[] = MOCK_PROJECTS
): Project[] {
  if (!searchValue.trim()) {
    return projects
  }
  
  const normalizedSearch = searchValue.toLowerCase().trim()
  
  return projects.filter(project => {
    const nameMatch = project.name.toLowerCase().includes(normalizedSearch)
    const descMatch = project.description?.toLowerCase().includes(normalizedSearch) || false
    return nameMatch || descMatch
  })
}

/**
 * 项目数据统计信息
 */
export const PROJECT_STATS = {
  total: MOCK_PROJECTS.length,
  active: getActiveProjects().length,
  archived: getArchivedProjects().length
} as const