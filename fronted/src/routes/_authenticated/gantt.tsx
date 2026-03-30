import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { GanttChartNew } from '@/features/gantt/components/gantt-chart-new'

const getGanttTopNav = (t: (key: string) => string) => [
  {
    title: t('navigation.gantt'),
    href: '/gantt',
    isActive: true,
    disabled: false,
  },
]

export function GanttPage() {
  const { t } = useTranslation()
  const topNavLinks = getGanttTopNav(t)

  return (
    <div className="flex h-screen flex-col">
      <AppHeader showBrand={false}>
        <TopNav links={topNavLinks} />
      </AppHeader>
      <Main className="flex-1">
        <GanttChartNew />
      </Main>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/gantt')({
  component: GanttPage,
})
