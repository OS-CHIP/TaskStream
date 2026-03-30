export const mockOverviewData = {
  totalProjects: 3,
  activeProjects: 28,
  completedProjects: 15,
  overdueProjects: 0
}

export const mockProjectStatusData = [
  { status: '进行中', count: 28, percentage: 65.1 },
  { status: '已完成', count: 15, percentage: 34.9 },
  { status: '已延期', count: 0, percentage: 0 }
]

export const mockEfficiencyData = {
  speed: 85,
  quality: 92,
  consistency: 78,
  overall: 85
}

export const mockWorkHours = [
  { date: '2025-12-01', hours: 7.5 },
  { date: '2025-12-02', hours: 8 },
  { date: '2025-12-03', hours: 6.5 },
  { date: '2025-12-04', hours: 8.5 },
  { date: '2025-12-05', hours: 7 },
  { date: '2025-12-06', hours: 5 },
  { date: '2025-12-07', hours: 0 }
]

export const mockTaskCompletion = {
  total: 42,
  completed: 36,
  overdue: 3,
  completionRate: 85.7
}

export const mockProjectByDate = [
  { date: '2025-11-27', created: 2, completed: 1 },
  { date: '2025-11-28', created: 1, completed: 2 },
  { date: '2025-11-29', created: 3, completed: 0 },
  { date: '2025-11-30', created: 1, completed: 1 },
  { date: '2025-12-01', created: 2, completed: 3 },
  { date: '2025-12-02', created: 0, completed: 2 },
  { date: '2025-12-03', created: 1, completed: 1 }
]
