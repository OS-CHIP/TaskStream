import * as React from 'react'
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTranslation } from 'react-i18next'
import { DataTablePagination } from '../components/data-table-pagination'
import { DataTableToolbar } from '../components/data-table-toolbar'
import { useAuthStore } from '@/stores/authStore'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      priority: false
    })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const auth = useAuthStore((state) => state.auth)
  const currentUserId = auth.userInfo?.id

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: -1, 
  })

  const normalizeUser = (u: any): number | undefined => {
    if (u == null) return undefined
    if (typeof u === 'object' && u.id != null) {
      const id = typeof u.id === 'string' ? parseInt(u.id, 10) : Number(u.id)
      return isNaN(id) ? undefined : id
    }
    const num = typeof u === 'string' ? parseInt(u, 10) : Number(u)
    return isNaN(num) ? undefined : num
  }

  return (
    <div className='space-y-4'>
      <DataTableToolbar table={table} />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan} className={(header.column.columnDef.meta as any)?.className}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  style={(() => {
                    let bg = 'rgba(200, 200, 200, 0.08)'
                    if (currentUserId != null) {
                      const original: any = row.original as any
                      const assigneeId = normalizeUser(original?.assignee)
                      const assignerId = normalizeUser(original?.assigner)
                      const isAssignee =
                        assigneeId != null &&
                        String(assigneeId) === String(currentUserId)
                      const isAssigner =
                        assignerId != null &&
                        String(assignerId) === String(currentUserId)
                      if (isAssignee) bg = 'rgba(0, 122, 255, 0.12)'
                      else if (isAssigner) bg = 'rgba(255, 159, 10, 0.12)'
                    }
                    return { backgroundColor: bg }
                  })()}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.className}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {t('tasks.table.noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}
