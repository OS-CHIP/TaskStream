import { ReactNode } from 'react'

export interface OverviewCardProps {
  title: string
  value: number | string
  icon: ReactNode
  trend?: number
  color: string
}

export interface StatChartProps {
  type: 'pie' | 'line' | 'bar' | 'radar'
  data: any
  options?: any
}

export interface QuickActionProps {
  title: string
  icon: ReactNode
  onClick: () => void
  color: string
}

export interface DashboardData {
  overview: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    overdueProjects: number
  }
  projectStats: {
    byStatus: Array<{ status: string; count: number; percentage: number }>
    byDate: Array<{ date: string; created: number; completed: number }>
  }
  personalStats: {
    workHours: Array<{ date: string; hours: number }>
    taskCompletion: {
      total: number
      completed: number
      overdue: number
      completionRate: number
    }
    efficiency: {
      speed: number
      quality: number
      consistency: number
      overall: number
    }
  }
}