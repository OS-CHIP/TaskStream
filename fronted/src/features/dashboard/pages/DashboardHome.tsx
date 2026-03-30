import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { OverviewCard } from '../components/OverviewCard'
import { StatChart } from '../components/StatChart'
import { QuickAction } from '../components/QuickAction'
import { pieOptions, getLineOptions, getBarOptions } from '../mock/chartData'
import { Briefcase, CheckCircle, Clock, AlertTriangle, Plus, FileText, Target, User } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DateRangeFilter } from '../components/DateRangeFilter'
import { useTranslation } from 'react-i18next'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationBell } from '@/components/notification-bell'
import { getDashboard } from '@/features/dashboard/services/dashboard.service'

export function DashboardHome() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const [stats, setStats] = useState<{ totalProjects: number; pending: number; inProgress: number; completed: number; canceled: number; blocked: number; overdue: number }>({ totalProjects: 0, pending: 0, inProgress: 0, completed: 0, canceled: 0, blocked: 0, overdue: 0 })
  const [createTrend, setCreateTrend] = useState<Array<{ date: string; count: number }>>([])
  const [completeTrend, setCompleteTrend] = useState<Array<{ date: string; count: number }>>([])
  const [workHours, setWorkHours] = useState<Array<{ date: string; hours: number }>>([])
  const initialFetchedRef = useRef(false)

  useEffect(() => {
    const formatDate = (d: Date) => {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
    const load = async () => {
      const now = new Date()
      const preset = typeof window !== 'undefined' ? (localStorage.getItem('dashboard_range_preset') || '7d') : '7d'
      const start = new Date(now)
      if (preset === '30d') {
        start.setDate(now.getDate() - 29)
      } else {
        start.setDate(now.getDate() - 6)
      }
      let startTime = `${formatDate(start)} 00:00:00`
      let dueTime = `${formatDate(now)} 23:59:59`
      if (preset === 'custom') {
        const s = typeof window !== 'undefined' ? (localStorage.getItem('dashboard_range_start') || '') : ''
        const e = typeof window !== 'undefined' ? (localStorage.getItem('dashboard_range_end') || '') : ''
        if (s) startTime = /^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s} 00:00:00` : s
        if (e) dueTime = /^\d{4}-\d{2}-\d{2}$/.test(e) ? `${e} 23:59:59` : e
      }
      const pidRaw = typeof window !== 'undefined' ? localStorage.getItem('selected_project_id') || '' : ''
      const projectId = /^\d+$/.test(pidRaw) ? Number(pidRaw) : (pidRaw || '')
      try {
        const res = await getDashboard({ startTime, dueTime, projectId })
        if ((res as any)?.code === 200) {
          const data = (res as any).data || (res as any)
          setStats(data.stats || { totalProjects: 0, pending: 0, inProgress: 0, completed: 0, canceled: 0, blocked: 0, overdue: 0 })
          setCreateTrend(Array.isArray(data.createTrend) ? data.createTrend : [])
          setCompleteTrend(Array.isArray(data.completeTrend) ? data.completeTrend : [])
          setWorkHours(Array.isArray(data.workHours) ? data.workHours : [])
        }
      } catch {}
    }
    if (!initialFetchedRef.current) {
      initialFetchedRef.current = true
      void load()
    }
    const handler = () => { load() }
    if (typeof window !== 'undefined') {
      window.addEventListener('dashboard_range_change', handler as EventListener)
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('dashboard_range_change', handler as EventListener)
      }
    }
  }, [])

  const statusPieData = {
    labels: [
      t('dashboard.status.pending', '待开始'),
      t('dashboard.status.inProgress'),
      t('dashboard.status.completed'),
      t('dashboard.status.canceled', '已取消'),
      t('dashboard.status.blocked', '已阻塞'),
      t('dashboard.status.overdue'),
    ],
    datasets: [{
      data: [
        stats.pending || 0,
        stats.inProgress || 0,
        stats.completed || 0,
        stats.canceled || 0,
        stats.blocked || 0,
        stats.overdue || 0,
      ],
      backgroundColor: [
        'rgb(250, 173, 20)',  // pending
        'rgb(24, 144, 255)',  // inProgress
        'rgb(82, 196, 26)',   // completed
        'rgb(245, 34, 45)',   // canceled
        'rgb(114, 46, 209)',  // blocked
        'rgb(250, 84, 28)',   // overdue
      ]
    }]
  }

  const lineData = {
    labels: createTrend.map(d => String(d.date || '').slice(5)),
    datasets: [
      { label: t('dashboard.datasets.created'), data: createTrend.map(d => d.count || 0), borderColor: '#1890ff', fill: false }
    ]
  }

  const completeLineData = {
    labels: completeTrend.map(d => String(d.date || '').slice(5)),
    datasets: [
      { label: t('dashboard.datasets.completed'), data: completeTrend.map(d => d.count || 0), borderColor: '#52c41a', fill: false }
    ]
  }

  const barData = {
    labels: workHours.map(d => String(d.date || '').slice(5)),
    datasets: [{
      label: t('dashboard.datasets.workHoursLabel'),
      data: workHours.map(d => Number(d.hours || 0)),
      backgroundColor: '#1890ff'
    }]
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center space-x-4">
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
      <div className="mb-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{t('dashboard.home.overviewTitle')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('dashboard.home.overviewSubtitle')}</p>
          </div>
          <div className="w-full lg:w-auto">
            <DateRangeFilter />
          </div>
        </div>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <OverviewCard title={t('dashboard.cards.totalProjects')} value={stats.totalProjects || 0} icon={<Briefcase size={20} />} color="bg-blue-100 text-blue-600" />
        <OverviewCard title={t('dashboard.cards.active')} value={stats.inProgress || 0} icon={<Clock size={20} />} color="bg-orange-100 text-orange-600" />
        <OverviewCard title={t('dashboard.cards.completed')} value={stats.completed || 0} icon={<CheckCircle size={20} />} color="bg-green-100 text-green-600" />
        <OverviewCard title={t('dashboard.cards.overdue')} value={stats.overdue || 0} icon={<AlertTriangle size={20} />} color="bg-red-100 text-red-600" />
      </div>

      {/* 快捷入口 */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{t('dashboard.quick.title')}</h2>
        <div className="flex flex-wrap">
          <QuickAction title={t('dashboard.quick.newProject')} icon={<Plus size={16} />} onClick={() => nav({ to: '/projects' })} color="bg-blue-500" />
          <QuickAction title={t('dashboard.quick.newTask')} icon={<FileText size={16} />} onClick={() => nav({ to: '/tasks/create' })} color="bg-green-500" />
          <QuickAction title={t('dashboard.quick.projectStats')} icon={<Target size={16} />} onClick={() => nav({ to: '/projects' })} color="bg-purple-500" />
        <QuickAction title={t('dashboard.quick.personalStats')} icon={<User size={16} />} onClick={() => nav({ to: '/my-tasks' })} color="bg-indigo-500" />
        </div>
      </div>
      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <StatChart type="pie" data={statusPieData} options={pieOptions} title={t('dashboard.charts.statusDistribution')} />
  <StatChart type="line" data={lineData} options={getLineOptions(t)} title={t('dashboard.charts.createdTrend')} />
  <StatChart type="line" data={completeLineData} options={getLineOptions(t)} title={t('dashboard.charts.completedTrend')} />
  <StatChart type="bar" data={barData} options={getBarOptions(t)} title={t('dashboard.charts.workHours')} />
      </div>
      </Main>
    
    </>
  )
}
