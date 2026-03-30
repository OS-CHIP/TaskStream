import { Cross2Icon } from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DataTableViewOptions } from '../components/data-table-view-options'
import { priorities, statuses } from '../data/data'
import { useTasks } from '../context/tasks-context'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@/stores/authStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation()
  const { filters, setFilters, loading, userMap } = useTasks()
  const isOwner = useAuthStore((s) => s.auth.isProjectOwner)
  const [searchValue, setSearchValue] = useState(filters.search || '')
  // 搜索输入不再自动触发筛选，仅在按下回车时提交
  
  // 同步外部filters变化到本地搜索状态
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || '')
    }
  }, [filters.search])

  const handleStatusChange = useCallback((value: string) => {
    const newStatus = value === 'all' ? undefined : value
    // 只有当状态真正改变时才更新
    if (newStatus !== filters.status) {
      setFilters({ status: newStatus })
    }
  }, [setFilters, filters.status])

  const handlePriorityChange = useCallback((value: string) => {
    const newPriority = value === 'all' ? undefined : value
    // 只有当优先级真正改变时才更新
    if (newPriority !== filters.priority) {
      setFilters({ priority: newPriority })
    }
  }, [setFilters, filters.priority])

  const peopleOptions = useMemo(() => {
    const allOpt = [{ label: t('common.allPeople'), value: 'all' }]
    if (!isOwner) return allOpt
    const opts = Object.entries(userMap || {}).map(([id, label]) => ({ label, value: id }))
    return [...allOpt, ...opts]
  }, [userMap, t, isOwner])

  const roleOptions = useMemo(() => ([
    { label: t('common.allTasks'), value: 'all' },
    { label: t('tasks.columns.assignee') || 'Assignee', value: 'assignee' },
    { label: t('tasks.columns.assigner') || 'Assigner', value: 'assigner' },
  ]), [t])

  const [selectedPerson, setSelectedPerson] = useState<string>('all')
  const [selectedRole, setSelectedRole] = useState<string>('all')

  useEffect(() => {
    if (!filters.people || filters.people.length === 0) setSelectedPerson('all')
    else setSelectedPerson(String(filters.people[0]))
    const dims = filters.roleDims && filters.roleDims.length > 0 ? filters.roleDims : ['assignee', 'assigner']
    setSelectedRole(dims.length === 2 ? 'all' : (dims[0] as string))
  }, [filters.people, filters.roleDims])

  useEffect(() => {
    if (!isOwner) {
      setSelectedPerson('all')
      setFilters({ people: undefined })
    }
  }, [isOwner, setFilters])

  const handlePersonChange = useCallback((value: string) => {
    setSelectedPerson(value)
    if (value === 'all') {
      setFilters({ people: undefined })
    } else {
      const id = parseInt(value)
      setFilters({ people: Number.isNaN(id) ? undefined : [id] })
    }
  }, [setFilters])

  const handleRoleChange = useCallback((value: string) => {
    setSelectedRole(value)
    const dims: Array<'assignee' | 'assigner'> =
      value === 'all' ? ['assignee', 'assigner'] : [value as 'assignee' | 'assigner']
    setFilters({ roleDims: dims })
  }, [setFilters])

  const handleReset = useCallback(() => {
    // 重置所有筛选条件
    setFilters({ search: undefined, status: undefined, priority: undefined, searchBy: 'title', people: undefined, roleDims: ['assignee', 'assigner'] })
    setSearchValue('')
    setSelectedPerson('all')
    setSelectedRole('all')
  }, [setFilters])

  const hasFilters = Boolean(filters.status || filters.priority || filters.search || (filters.people && filters.people.length > 0))

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Select value={filters.searchBy || 'title'} onValueChange={(value) => setFilters({ searchBy: value as 'title' | 'code' })} disabled={loading}>
          <SelectTrigger className='h-8 w-[120px]'>
            <SelectValue placeholder={t('tasks.toolbar.searchBy')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='title'>{t('tasks.toolbar.searchByTitle')}</SelectItem>
            <SelectItem value='code'>{t('tasks.toolbar.searchByCode')}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={filters.searchBy === 'code' ? t('tasks.toolbar.searchByCodePlaceholder') : t('tasks.toolbar.searchPlaceholder')}
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              setFilters({ search: searchValue || undefined })
            }
          }}
          className='h-8 w-[150px] lg:w-[250px]'
          disabled={loading}
        />
        <div className='flex gap-x-2'>
          {/* 状态筛选 */}
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange} disabled={loading}>
            <SelectTrigger className='h-8 w-[120px]'>
              <SelectValue placeholder={t('tasks.toolbar.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('tasks.toolbar.allStatus')}</SelectItem>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 优先级筛选 */}
          <Select value={filters.priority || 'all'} onValueChange={handlePriorityChange} disabled={loading}>
            <SelectTrigger className='h-8 w-[120px]'>
              <SelectValue placeholder={t('tasks.toolbar.priority')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('tasks.toolbar.allPriority')}</SelectItem>
              {priorities.map((priority) => (
                <SelectItem key={priority.value} value={priority.value}>
                  {priority.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 人员筛选 MultiSelect */}
          <Select value={selectedPerson} onValueChange={handlePersonChange} disabled={loading}>
            <SelectTrigger className='h-9 w-[180px] px-2'>
              <SelectValue placeholder={'人员筛选'} />
            </SelectTrigger>
            <SelectContent>
              {peopleOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className='h-9 flex items-center px-1 text-sm text-muted-foreground'>
            {t('common.by') || 'by'}
          </div>
          <Select value={selectedRole} onValueChange={handleRoleChange} disabled={loading}>
            <SelectTrigger className='h-9 w-[160px] px-2'>
              <SelectValue placeholder={'assignee / assigner'} />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button
            type='button'
            variant='ghost'
            onClick={handleReset}
            className='h-8 px-2 lg:px-3'
            disabled={loading}
          >
            {t('common.reset')}
            <Cross2Icon className='ml-2 h-4 w-4' />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
}
