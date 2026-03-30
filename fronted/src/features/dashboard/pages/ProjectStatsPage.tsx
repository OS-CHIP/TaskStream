import { useNavigate } from '@tanstack/react-router'
import { OverviewCard } from '../components/OverviewCard'
import { StatChart } from '../components/StatChart'
import { mockOverviewData, mockProjectStatusData, mockProjectByDate } from '../mock/dashboardData'
import { pieOptions, getLineOptions } from '../mock/chartData'
import { Briefcase, TrendingUp, Calendar, Flag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { NotificationBell } from '@/components/notification-bell'

export function ProjectStatsPage() {
  const nav = useNavigate()
  const { t } = useTranslation()

  const statusPieData = {
    labels: [
      t('dashboard.status.inProgress'),
      t('dashboard.status.completed'),
      t('dashboard.status.overdue'),
    ],
    datasets: [{
      data: mockProjectStatusData.map(d => d.count),
      backgroundColor: ['#1890ff', '#52c41a', '#faad14']
    }]
  }

  const lineData = {
    labels: mockProjectByDate.map(d => d.date.slice(5)),
    datasets: [
      { label: t('dashboard.datasets.created'), data: mockProjectByDate.map(d => d.created), borderColor: '#1890ff', fill: false }
    ]
  }

  const completeLineData = {
    labels: mockProjectByDate.map(d => d.date.slice(5)),
    datasets: [
      { label: t('dashboard.datasets.completed'), data: mockProjectByDate.map(d => d.completed), borderColor: '#52c41a', fill: false }
    ]
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.stats.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.stats.subtitle')}</p>
        </div>
        <button
          onClick={() => nav({ to: '/dashboard' })}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm"
        >
          返回仪表盘
        </button>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <OverviewCard title={t('dashboard.cards.totalProjects')} value={mockOverviewData.totalProjects} icon={<Briefcase size={20} />} color="bg-blue-100 text-blue-600" />
        <OverviewCard title={t('dashboard.cards.active')} value={mockOverviewData.activeProjects} icon={<Flag size={20} />} color="bg-orange-100 text-orange-600" />
        <OverviewCard title={t('dashboard.cards.completed')} value={mockOverviewData.completedProjects} icon={<TrendingUp size={20} />} color="bg-green-100 text-green-600" trend={+5.2} />
        <OverviewCard title={t('dashboard.cards.overdue')} value={mockOverviewData.overdueProjects} icon={<Calendar size={20} />} color="bg-red-100 text-red-600" />
      </div>
      {/* 图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <StatChart type="pie" data={statusPieData} options={pieOptions} title={t('dashboard.charts.statusDistribution')} />
  <StatChart type="line" data={lineData} options={getLineOptions(t)} title={t('dashboard.charts.createdTrend')} />
        <StatChart type="line" data={completeLineData} options={getLineOptions(t)} title={t('dashboard.charts.completedTrend')} />
      </div>
      </Main>
    </>
  )
}
