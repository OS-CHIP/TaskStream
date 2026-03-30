import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useNavigate } from '@tanstack/react-router'
import { useTasks } from '../context/tasks-context'

interface DataTablePaginationProps<TData> {
  table: Table<TData>
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pagination, setPagination } = useTasks()

  const handlePageChange = (newPageIndex: number) => {
    setPagination(prev => ({ ...prev, pageIndex: newPageIndex }))
    navigate({ to: '/tasks', search: (prev: any) => ({ ...prev, page: newPageIndex + 1 }) })
  }

  return (
    <div
      className='flex items-center justify-between overflow-clip px-2'
      style={{ overflowClipMargin: 1 }}
    >
      <div className='text-muted-foreground hidden flex-1 text-sm sm:block'>
        {t('tasks.pagination.selectedRows', {
          selected: table.getFilteredSelectedRowModel().rows.length,
          total: pagination.total
        })}
      </div>
      <div className='flex items-center sm:space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='hidden text-sm font-medium sm:block'>{t('tasks.pagination.rowsPerPage')}</p>
          <Select
            value={`${pagination.pageSize}`}
            onValueChange={(value) => {
              setPagination(prev => ({ ...prev, pageSize: Number(value), pageIndex: 0 }))
              navigate({ to: '/tasks', search: (prev: any) => ({ ...prev, page: 1 }) })
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex w-[100px] items-center justify-center text-sm font-medium'>
          {t('tasks.pagination.pageInfo', {
            current: pagination.pageIndex + 1,
            total: Math.ceil(pagination.total / pagination.pageSize)
          })}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => handlePageChange(0)}
            disabled={pagination.pageIndex === 0}
          >
            <span className='sr-only'>{t('tasks.pagination.goToFirstPage')}</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => handlePageChange(Math.max(0, pagination.pageIndex - 1))}
            disabled={pagination.pageIndex === 0}
          >
            <span className='sr-only'>{t('tasks.pagination.goToPreviousPage')}</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => handlePageChange(pagination.pageIndex + 1)}
            disabled={pagination.pageIndex >= Math.ceil(pagination.total / pagination.pageSize) - 1}
          >
            <span className='sr-only'>{t('tasks.pagination.goToNextPage')}</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.pageSize) - 1)}
            disabled={pagination.pageIndex >= Math.ceil(pagination.total / pagination.pageSize) - 1}
          >
            <span className='sr-only'>{t('tasks.pagination.goToLastPage')}</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
