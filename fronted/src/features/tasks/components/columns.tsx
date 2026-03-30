import { ColumnDef } from '@tanstack/react-table'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { priorities, statuses } from '../data/data'
import { Task, TaskPriorityType } from '../data/schema'
import { DataTableColumnHeader } from './data-table-column-header'
import { DataTableRowActions } from './data-table-row-actions'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useTasks } from '../context/tasks-context'
import { CompletionProgress } from './completion-progress'
import { useTranslation } from 'react-i18next'

// 标题单元格组件
function TitleCell({ row }: { row: any }) {
  const navigate = useNavigate()
  const taskId = row.original?.id
  const search = useSearch({ from: '/_authenticated/tasks/' })
  const currentPage = search.page || 1

  const handleTitleClick = () => {
    navigate({ to: `/tasks/${taskId}`, search: { page: currentPage } })
  }

  return (
    <div className='flex space-x-2'>
      <span
        className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem] cursor-pointer text-blue-600 hover:text-blue-800 hover:underline'
        onClick={handleTitleClick}
      >
        {row.getValue('title')}
      </span>
    </div>
  )
}

// 负责人显示单元格组件
function AssigneeCell({ row }: { row: any }) {
  const { userMap } = useTasks()
  const assigneeId = row.getValue('assignee')
  
  if (!assigneeId) return <div className="text-muted-foreground text-center">-</div>

  const assigneeName = userMap[Number(assigneeId)]

  return (
    <div className='truncate' title={assigneeName || String(assigneeId)}>
      {assigneeName || assigneeId}
    </div>
  )
}

// 分配人显示单元格组件
function AssignerCell({ row }: { row: any }) {
  const { userMap } = useTasks()
  const assignerId = row.original?.assigner

  if (!assignerId) return <div className="text-muted-foreground text-center">-</div>
  
  const assignerName = userMap[Number(assignerId)]

  return (
    <div className='truncate' title={assignerName || String(assignerId)}>
      {assignerName || assignerId}
    </div>
  )
}

function MakeCopyCell({ row }: { row: any }) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const original = row.original as Task
  if (Number((original as any).type) === 1) {
    return null
  }

  const normalizeUser = (u: any): number | undefined => {
    if (u == null) return undefined
    if (typeof u === 'object' && u.id != null) {
      const id = typeof u.id === 'string' ? parseInt(u.id, 10) : Number(u.id)
      return isNaN(id) ? undefined : id
    }
    const num = typeof u === 'string' ? parseInt(u, 10) : Number(u)
    return isNaN(num) ? undefined : num
  }

  const handleClick = () => {
    const assignee = normalizeUser((original as any).assignee)
    const assigner = normalizeUser((original as any).assigner)
    const type = String((original as any).type || '')
    const priority: TaskPriorityType | undefined = original.priority as TaskPriorityType
    const estimatedHours =
      (original as any).estimatedHours != null
        ? Number((original as any).estimatedHours)
        : undefined
    const parentTask = Array.isArray((original as any).parentTask)
      ? (original as any).parentTask.map((p: any) =>
          typeof p === 'object' && p?.id ? String(p.id) : String(p)
        )
      : []

    navigate({
      to: '/tasks/create',
      search: {
        source: '/tasks',
        assignee,
        assigner,
        type,
        priority,
        estimatedHours,
        parentTask,
      },
    })
  }

  return (
    <Button variant='outline' className='h-8 px-2' onClick={handleClick}>
      {t('tasks.actions.makeCopy')}
    </Button>
  )
}

export const createColumns = (t: (key: string) => string): ColumnDef<Task>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={t('tasks.accessibility.selectAll')}
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t('tasks.accessibility.selectRow')}
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'taskCode',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.task')} />
    ),
    cell: ({ row }) => (
      <div className='truncate' title={String(row.getValue('taskCode') || '')}>
        {row.getValue('taskCode')}
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      className: 'w-[150px]'
    }
  },
  {
    accessorKey: 'tags',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.tags') || '标签'} />
    ),
    cell: ({ row }) => {
      const tags = row.original.tags
      if (!tags || tags.length === 0) return null
      
      const firstTag = tags[0]
      return (
        <div className="flex items-center">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {firstTag}
          </span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.title')} />
    ),
    cell: ({ row }) => <TitleCell row={row} />,
  },
  {
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.status')} />
    ),
    cell: ({ row }) => {
      const original = row.original as Task
      const isSystem = String((original as any)?.type) === '1'
      const raw = String((original as any)?.rawStatus || '')
      if (isSystem && ['100', '101', '102'].includes(raw)) {
        const labelMap: Record<string, string> = {
          '100': '待审批',
          '101': '已同意',
          '102': '已拒绝',
        }
        const iconMap: Record<string, any> = {
          '100': statuses.find(s => s.value === '1')?.icon, // 用待开始的圆圈作占位
          '101': statuses.find(s => s.value === '3')?.icon, // 用已完成图标
          '102': statuses.find(s => s.value === '4')?.icon, // 用已取消图标
        }
        const IconComp = iconMap[raw]
        return (
          <div className='flex w-[100px] items-center'>
            {IconComp ? <IconComp className='text-muted-foreground mr-2 h-4 w-4' /> : null}
            <span>{labelMap[raw]}</span>
          </div>
        )
      }
      const statusObj = statuses.find(s => s.value === row.getValue('status'))
      if (!statusObj) return null
      const IconComp = statusObj.icon
      return (
        <div className='flex w-[100px] items-center'>
          {IconComp ? <IconComp className='text-muted-foreground mr-2 h-4 w-4' /> : null}
          <span>{statusObj.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'completionPercentage',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.progress')} />
    ),
    cell: ({ row }) => {
      const original = row.original as Task
      const isSystem = String((original as any)?.type) === '1'
      const raw = String((original as any)?.rawStatus || '')
      const value = isSystem && (raw === '101' || raw === '102')
        ? 100
        : (original?.completionPercentage ?? 0)
      return <CompletionProgress value={value} />
    },
    enableSorting: true,
    meta: {
      className: 'w-[160px]'
    }
  },
  // {
  //   accessorKey: 'type',
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title={t('tasks.columns.type')} />
  //   ),
  //   cell: ({ row }) => <TypeCell row={row} t={t} />,
  //   enableSorting: false,
  // },
  {
    accessorKey: 'assignee',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.assignee') || '负责人'} />
    ),
    cell: ({ row }) => <AssigneeCell row={row} />,
    enableSorting: false,
    meta: {
      className: 'w-[100px]'
    }
  },
  {
    accessorKey: 'assigner',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.assigner') || '分配人'} />
    ),
    cell: ({ row }) => <AssignerCell row={row} />,
    enableSorting: false,
    meta: {
      className: 'w-[100px]'
    }
  },
  {
    accessorKey: 'priority',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.priority')} />
    ),
    cell: ({ row }) => {
      const priority = priorities.find(
        (priority) => priority.value === row.getValue('priority')
      )

      if (!priority) {
        return null
      }

      return (
        <div className='flex items-center'>
          {priority.icon && (
            <priority.icon className='text-muted-foreground mr-2 h-4 w-4' />
          )}
          <span>{priority.label}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    id: 'actions',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.columns.actions') || '操作列'} />
    ),
    cell: ({ row }) => <DataTableRowActions row={row} />,
    meta: {
      className: 'w-[160px]'
    }
  },
  {
    id: 'makeCopy',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={t('tasks.actions.makeCopy')} />
    ),
    cell: ({ row }) => <MakeCopyCell row={row} />,
    enableSorting: false,
    meta: {
      className: 'w-[140px]'
    }
  },
]
