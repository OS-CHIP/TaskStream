import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Task, TaskStatus, TaskPriority, TaskLabel } from '@/features/tasks/data/schema'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { useTranslation } from 'react-i18next'
import { getProjectOverview } from '@/features/project-overview/services/overview.service'
import { getProjectMemberTasksInfo } from '@/features/projects/services/member-tasks.service'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'

interface ProjectMember {
  label: string
  value: number
}

interface MemberStats {
  member: ProjectMember
  total: number
  completed: number
  uncompleted: number
  tasks: Task[]
}

// 静态模拟数据 - 成员
const MOCK_MEMBERS: ProjectMember[] = [
  { label: '张三', value: 1 },
  { label: '李四', value: 2 },
  { label: '王五', value: 3 },
  { label: '赵六', value: 4 },
]

// 静态模拟数据 - 任务
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: '设计新版首页 UI',
    status: TaskStatus.DONE,
    label: TaskLabel.DESIGN_TASK,
    priority: TaskPriority.HIGH,
    type: '1',
    assignee: 1,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: '实现用户登录接口',
    status: TaskStatus.IN_PROGRESS,
    label: TaskLabel.DEFAULT,
    priority: TaskPriority.HIGH,
    type: '2',
    assignee: 2,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: '修复导航栏样式兼容性问题',
    status: TaskStatus.TODO,
    label: TaskLabel.BUG,
    priority: TaskPriority.MEDIUM,
    type: '3',
    assignee: 3,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: '编写项目文档',
    status: TaskStatus.DONE,
    label: TaskLabel.OTHER,
    priority: TaskPriority.LOW,
    type: '5',
    assignee: 1,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: '数据库性能优化',
    status: TaskStatus.BLOCKED,
    label: TaskLabel.DEFAULT,
    priority: TaskPriority.HIGH,
    type: '4',
    assignee: 2,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    title: '前端路由配置重构',
    status: TaskStatus.IN_PROGRESS,
    label: TaskLabel.DEFAULT,
    priority: TaskPriority.MEDIUM,
    type: '2',
    assignee: 4,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '7',
    title: '添加单元测试',
    status: TaskStatus.TODO,
    label: TaskLabel.TEST_TASK,
    priority: TaskPriority.LOW,
    type: '2',
    assignee: 3,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '8',
    title: '移动端适配调整',
    status: TaskStatus.TODO,
    label: TaskLabel.DESIGN_TASK,
    priority: TaskPriority.MEDIUM,
    type: '1',
    assignee: 4,
    parentTask: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

// 颜色常量
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']
const PRIORITY_COLORS = {
  [TaskPriority.HIGH]: '#ef4444', // red-500
  [TaskPriority.MEDIUM]: '#eab308', // yellow-500
  [TaskPriority.LOW]: '#3b82f6', // blue-500
}

export default function ProjectOverview() {
  const { t } = useTranslation()
  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [overview, setOverview] = useState<{
    taskStatics: {
      totalTasks: number
      completedTasks: number
      inProgressTasks: number
    }
    status: { status: string | null; count: number; percent: number }[]
    priority: { level: string; count: number }[]
  } | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const pid = typeof window !== 'undefined' ? (localStorage.getItem('selected_project_id') || '52') : '52'
        const res = await getProjectOverview(pid)
        setOverview(res)
      } catch {
        setOverview({
          taskStatics: {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
          },
          status: [],
          priority: [],
        })
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const pid = typeof window !== 'undefined' ? (localStorage.getItem('selected_project_id') || '52') : '52'
        const res = await getProjectMemberTasksInfo(pid)
        const list = res || []
        const mappedMembers: ProjectMember[] = list.map((m, idx) => ({ label: m.userName, value: idx + 1 }))
        const mappedTasks: Task[] = []
        list.forEach((m, mIdx) => {
          const assigneeId = mIdx + 1
          m.memberTasks.forEach((t, tIdx) => {
            const priority =
              t.priority === 1 ? TaskPriority.HIGH :
              t.priority === 2 ? TaskPriority.MEDIUM :
              TaskPriority.LOW
            mappedTasks.push({
              id: `${mIdx + 1}-${tIdx + 1}`,
              title: t.taskTitle,
              status: String(t.status) as typeof TaskStatus[keyof typeof TaskStatus],
              label: TaskLabel.DEFAULT,
              priority,
              assignee: assigneeId,
              parentTask: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          })
        })
        setMembers(mappedMembers)
        setTasks(mappedTasks)
      } catch {
        setMembers(MOCK_MEMBERS)
        setTasks(MOCK_TASKS)
      }
    })()
  }, [])

  // Calculate Overall Stats
  const totalTasks = overview?.taskStatics.totalTasks ?? 0
  const completedTasks = overview?.taskStatics.completedTasks ?? 0
  const uncompletedTasks = overview ? overview.taskStatics.totalTasks - overview.taskStatics.completedTasks : 0

  // Prepare Chart Data
  const statusLabel = (code: string | null) => {
    switch (code) {
      case '1':
        return t('tasks.status.todo')
      case '2':
        return t('tasks.status.inProgress')
      case '3':
        return t('tasks.status.done')
      case '4':
        return t('tasks.status.blocked')
      case '5':
        return t('tasks.status.canceled')
      default:
        return '未设置'
    }
  }

  const statusData = (overview?.status ?? [])
    .map(item => ({ name: statusLabel(item.status), value: item.count, percent: item.percent }))

  const priorityData = (() => {
    const items = overview?.priority ?? []
    const data: { name: string; value: number; fill: string }[] = []
    const knownLevels: Record<string, { name: string; fill: string }> = {
      '1': { name: t('tasks.priority.high'), fill: PRIORITY_COLORS[TaskPriority.HIGH] },
      '2': { name: t('tasks.priority.medium'), fill: PRIORITY_COLORS[TaskPriority.MEDIUM] },
      '3': { name: t('tasks.priority.low'), fill: PRIORITY_COLORS[TaskPriority.LOW] },
    }

    let otherCount = 0
    items.forEach(item => {
      const meta = knownLevels[item.level]
      if (meta) {
        data.push({ name: meta.name, value: item.count, fill: meta.fill })
      } else {
        otherCount += item.count
      }
    })

    if (otherCount > 0) {
      data.push({ name: '其他', value: otherCount, fill: '#9CA3AF' })
    }

    return data
  })()

  // Calculate Member Stats
  const memberStats: MemberStats[] = members.map(member => {
    const memberTasks = tasks.filter(t => t.assignee === member.value)
    const memberCompleted = memberTasks.filter(t => t.status === TaskStatus.DONE).length
    return {
      member,
      total: memberTasks.length,
      completed: memberCompleted,
      uncompleted: memberTasks.length - memberCompleted,
      tasks: memberTasks
    }
  }).sort((a, b) => b.total - a.total) // Sort by total tasks desc

  return (
    <>
      <AppHeader fixed />
      <Main className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('projectOverview.title')}</h1>
        <p className="text-muted-foreground">{t('projectOverview.subtitle')}</p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projectOverview.cards.total.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {t('projectOverview.cards.total.desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projectOverview.cards.completed.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {t('projectOverview.cards.completed.desc')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('projectOverview.cards.uncompleted.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{uncompletedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {t('projectOverview.cards.uncompleted.desc')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('projectOverview.charts.statusDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const val = Number(entry?.payload?.value ?? 0)
                    if (val <= 0) return ''
                    const pct = Number(entry?.payload?.percent ?? 0)
                    return `${entry.name} ${pct.toFixed(0)}%`
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('projectOverview.charts.priorityDistribution')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name={t('projectOverview.charts.taskCount')}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Member Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t('projectOverview.member.sectionTitle')}</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {memberStats.map((stat) => (
            <Card key={stat.member.value} className="flex flex-col">
              <CardHeader>
                <CardTitle>{stat.member.label}</CardTitle>
                <CardDescription>
                  {t('projectOverview.member.total')}: {stat.total} | {t('projectOverview.member.completed')}: {stat.completed} | {t('projectOverview.member.todo')}: {stat.uncompleted}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ScrollArea className="h-[200px] w-full pr-4">
                  {stat.tasks.length > 0 ? (
                    <div className="space-y-2">
                      {stat.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                          <div className="flex flex-col gap-1 overflow-hidden">
                            <span className="truncate text-sm font-medium" title={task.title}>
                              {task.title}
                            </span>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                    {task.status === TaskStatus.DONE ? t('tasks.status.done') : 
                                     task.status === TaskStatus.IN_PROGRESS ? t('tasks.status.inProgress') :
                                     task.status === TaskStatus.TODO ? t('tasks.status.todo') : 
                                     task.status === TaskStatus.BLOCKED ? t('tasks.status.blocked') : task.status}
                                </Badge>
                                <span className={`text-[10px] ${
                                    task.priority === TaskPriority.HIGH ? 'text-red-500' : 
                                    task.priority === TaskPriority.MEDIUM ? 'text-yellow-500' : 'text-blue-500'
                                }`}>
                                    {task.priority === TaskPriority.HIGH ? t('tasks.priority.high') : 
                                     task.priority === TaskPriority.MEDIUM ? t('tasks.priority.medium') : t('tasks.priority.low')}
                                </span>
                            </div>
                          </div>
                          <Link
                            to="/tasks/$taskId"
                            params={{ taskId: String(task.id) }}
                            search={{ from: '/project-overview' }}
                            className="shrink-0"
                          >
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                              {t('common.detail', { defaultValue: '详情' })}
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">
                      {t('projectOverview.empty')}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      </Main>
    </>
  )
}
