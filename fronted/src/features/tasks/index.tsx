import { useTranslation } from 'react-i18next'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notification-bell'
import { createColumns } from './components/columns'
import { DataTable } from './components/data-table'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import TasksProvider, { useTasks } from './context/tasks-context'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

function TasksContent() {
  const { t } = useTranslation()
  const { tasks, loading, error } = useTasks()
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
        <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {t('tasks.title')}
            </h2>
            <p className='text-muted-foreground'>{t('tasks.description')}</p>
          </div>
          <TasksPrimaryButtons />
        </div>
        
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          {error && (
            <Alert className='mb-4 border-red-200 bg-red-50'>
              <AlertDescription className='text-red-700'>
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin' />
              <span className='ml-2'>{t('tasks.loading')}</span>
            </div>
          ) : (
            <DataTable data={tasks} columns={createColumns(t)} />
          )}
        </div>
      </Main>

      <TasksDialogs />
    </>
  )
}

export default function Tasks() {
  return (
    <TasksProvider>
      <TasksContent />
    </TasksProvider>
  )
}
