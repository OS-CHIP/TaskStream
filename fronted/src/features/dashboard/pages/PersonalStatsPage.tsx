import { useNavigate } from '@tanstack/react-router'
import { StatChart } from '../components/StatChart'
import { OverviewCard } from '../components/OverviewCard'
import { mockWorkHours, mockTaskCompletion, mockEfficiencyData } from '../mock/dashboardData'
import { getBarOptions, pieOptions } from '../mock/chartData'
import { Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export function PersonalStatsPage() {
  const nav = useNavigate()
  const { t } = useTranslation()

  const barData = {
    labels: mockWorkHours.map(d => d.date.slice(5)),
    datasets: [{
      label: t('dashboard.datasets.workHoursLabel'),
      data: mockWorkHours.map(d => d.hours),
      backgroundColor: '#1890ff'
    }]
  }

  const pieData = {
    labels: [t('dashboard.status.completed'), t('dashboard.status.inProgress'), t('dashboard.status.overdue')],
    datasets: [{
      data: [mockTaskCompletion.completed, mockTaskCompletion.total - mockTaskCompletion.completed - mockTaskCompletion.overdue, mockTaskCompletion.overdue],
      backgroundColor: ['#52c41a', '#1890ff', '#faad14']
    }]
  }

  return (
    <div className="dashboard-container">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.personal.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('dashboard.personal.subtitle')}</p>
        </div>
        <button
          onClick={() => nav({ to: '/dashboard' })}
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition text-sm"
        >
          {t('dashboard.personal.backToDashboard')}
        </button>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <OverviewCard title={t('dashboard.personal.cards.completionRate')} value={`${mockTaskCompletion.completionRate}%`} icon={<CheckCircle size={20} />} color="bg-green-100 text-green-600" />
        <OverviewCard title={t('dashboard.personal.cards.totalTasks')} value={mockTaskCompletion.total} icon={<TrendingUp size={20} />} color="bg-blue-100 text-blue-600" />
        <OverviewCard title={t('dashboard.cards.completed')} value={mockTaskCompletion.completed} icon={<CheckCircle size={20} />} color="bg-green-100 text-green-600" />
        <OverviewCard title={t('dashboard.cards.overdue')} value={mockTaskCompletion.overdue} icon={<AlertTriangle size={20} />} color="bg-red-100 text-red-600" />
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatChart type="bar" data={barData} options={getBarOptions(t)} title={t('dashboard.charts.workHours')} />
        <StatChart type="pie" data={pieData} options={pieOptions} title={t('dashboard.charts.taskCompletion')} />
      </div>

      {/* 效率指标 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <OverviewCard title={t('dashboard.personal.metrics.speed')} value={`${mockEfficiencyData.speed}%`} icon={<TrendingUp size={20} />} color="bg-purple-100 text-purple-600" />
        <OverviewCard title={t('dashboard.personal.metrics.quality')} value={`${mockEfficiencyData.quality}%`} icon={<CheckCircle size={20} />} color="bg-teal-100 text-teal-600" />
        <OverviewCard title={t('dashboard.personal.metrics.consistency')} value={`${mockEfficiencyData.consistency}%`} icon={<Clock size={20} />} color="bg-indigo-100 text-indigo-600" />
        <OverviewCard title={t('dashboard.personal.metrics.overall')} value={`${mockEfficiencyData.overall}%`} icon={<TrendingUp size={20} />} color="bg-yellow-100 text-yellow-600" />
      </div>
    </div>
  )
}
