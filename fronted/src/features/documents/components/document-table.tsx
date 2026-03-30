import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'
import { type Document } from '../types/document'
import { formatDate } from '../data/mock-documents'
import { DataTablePagination } from '../../users/components/data-table-pagination'

interface DocumentTableProps {
  data: Document[]
  loading?: boolean
  onView?: (document: Document) => void
  onEdit?: (document: Document) => void
  onDelete?: (document: Document) => void
  onDownload?: (document: Document) => void
  onAction?: (action: string, documentId: string) => void
  onSort?: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
}

// 文档状态样式映射
const statusStyles = {
  '草稿': 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  '审核中': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  '已发布': 'bg-green-100 text-green-800 hover:bg-green-200',
  '已归档': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
}

// 文档类型样式映射
const typeStyles = {
  '技术方案': 'bg-purple-100 text-purple-800',
  '需求文档': 'bg-blue-100 text-blue-800',
  '设计文档': 'bg-pink-100 text-pink-800',
  '测试文档': 'bg-orange-100 text-orange-800',
  '用户手册': 'bg-green-100 text-green-800',
  '项目计划': 'bg-indigo-100 text-indigo-800',
  '会议纪要': 'bg-yellow-100 text-yellow-800',
  '其他': 'bg-gray-100 text-gray-800',
}

export function DocumentTable({
  data,
  // loading = false,
  onView,
  onEdit,
  onDelete,
  onDownload,
  pagination,
}: DocumentTableProps) {
  const { t } = useTranslation()
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const columns: ColumnDef<Document>[] = React.useMemo(
    () => [
      {
        accessorKey: 'title',
        header: t('documents.columns.title'),
        cell: ({ row }) => {
          const document = row.original
          return (
            <div className="flex flex-col space-y-1">
              <button
                type="button"
                className="font-medium text-sm text-left hover:text-blue-600"
                onClick={() => onView?.(document)}
              >
                {document.title}
              </button>
              {document.description && (
                <span className="text-xs text-muted-foreground line-clamp-2">
                  {document.description}
                </span>
              )}
            </div>
          )
        },
      },
      {
        accessorKey: 'type',
        header: t('documents.columns.type'),
        cell: ({ row }) => {
          const type = row.getValue('type') as keyof typeof typeStyles
          return (
            <Badge
              variant="secondary"
              className={`${typeStyles[type]} border-0`}
            >
              {type}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'status',
        header: t('documents.columns.status'),
        cell: ({ row }) => {
          const status = row.getValue('status') as keyof typeof statusStyles
          return (
            <Badge
              variant="secondary"
              className={`${statusStyles[status]} border-0`}
            >
              {status}
            </Badge>
          )
        },
        filterFn: (row, id, value) => {
          return value.includes(row.getValue(id))
        },
      },
      {
        accessorKey: 'createdAt',
        header: t('documents.columns.createdAt'),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {formatDate(row.getValue('createdAt'))}
          </span>
        ),
      },
      {
        id: 'actions',
        header: t('documents.columns.actions'),
        cell: ({ row }) => {
          const document = row.original
          return (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView?.(document)}
                className="h-8 w-8 p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none transition-none"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(document)}
                className="h-8 w-8 p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none transition-none"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete?.(document)}
                className="h-8 w-8 p-0 hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none transition-none"
                aria-label={t('documents.actions.delete')}
                title={t('documents.actions.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )
        },
      },
    ],
    [onView, onEdit, onDelete, onDownload, t]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      ...(pagination && {
        pagination: {
          pageIndex: Math.max(0, (pagination.page || 1) - 1),
          pageSize: pagination.pageSize || 10,
        },
      }),
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    ...(pagination && {
      onPaginationChange: (updater) => {
        const current = {
          pageIndex: Math.max(0, (pagination.page || 1) - 1),
          pageSize: pagination.pageSize || 10,
        }
        const next = typeof updater === 'function' ? (updater as any)(current) : updater
        if (next.pageSize !== current.pageSize) {
          pagination.onPageSizeChange?.(next.pageSize)
        }
        if (next.pageIndex !== current.pageIndex) {
          const nextPage = next.pageIndex + 1
          pagination.onPageChange?.(nextPage)
        }
      },
      manualPagination: true,
      pageCount: Math.max(1, Math.ceil((pagination.total || 0) / (pagination.pageSize || 10))),
    }),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                  className="hover:bg-muted/50 transition-none"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  {t('common.noData')}
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
