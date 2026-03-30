import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { KanbanBoard } from '@/features/kanban/components/kanban-board'

// 看板导航配置
const getKanbanTopNav = (t: (key: string) => string) => [
  {
    id: 'kanban',
    title: t('navigation.kanban'),
    href: '/kanban',
    isActive: true,
    disabled: false,
  },
]

export function KanbanPage() {
  const { t } = useTranslation()
  const topNavLinks = getKanbanTopNav(t)

  return (
    <div className="flex h-screen flex-col">
      <AppHeader>
        <TopNav links={topNavLinks} />
      </AppHeader>
      <Main fixed className="flex-1 overflow-hidden">
        <KanbanBoard />
      </Main>
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/kanban')({
  component: KanbanPage,
})
