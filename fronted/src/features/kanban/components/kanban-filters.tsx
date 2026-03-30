import React, { useState, useCallback } from 'react'
import { Search, Filter, X, Calendar, User, Tag, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import type { KanbanFilters } from '@/features/tasks/data/schema'
import { TaskPriority, TaskLabel } from '@/features/tasks/data/schema'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { useDebounce } from '@/hooks/use-debounce'

interface KanbanFiltersProps {
  filters: KanbanFilters
  onFiltersChange: (filters: Partial<KanbanFilters>) => void
  onClearFilters: () => void
  className?: string
}

/**
 * 看板筛选组件
 * 提供搜索、优先级、标签、负责人、截止日期等筛选功能
 */
export function KanbanFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className
}: KanbanFiltersProps) {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // 防抖搜索
  const debouncedSearch = useDebounce(searchValue, 300)

  // 当防抖值变化时更新筛选条件
  React.useEffect(() => {
    onFiltersChange({ search: debouncedSearch })
  }, [debouncedSearch, onFiltersChange])

  // 优先级选项
  const priorityOptions = [
    { value: TaskPriority.LOW, label: t('tasks.priority.low') },
    { value: TaskPriority.MEDIUM, label: t('tasks.priority.medium') },
    { value: TaskPriority.HIGH, label: t('tasks.priority.high') }
  ]

  // 标签选项
  const labelOptions = [
    { value: TaskLabel.BUG, label: t('tasks.labels.bug') },
    { value: TaskLabel.DESIGN_TASK, label: t('tasks.labels.design_task') },
      { value: TaskLabel.TEST_TASK, label: t('tasks.labels.test_task') },
      { value: TaskLabel.DEFAULT, label: t('tasks.labels.default') },
      { value: TaskLabel.OTHER, label: t('tasks.labels.other') }
  ]

  // 模拟负责人选项
  const assigneeOptions = [
    { value: '张三', label: '张三' },
    { value: '李四', label: '李四' },
    { value: '王五', label: '王五' },
    { value: '赵六', label: '赵六' }
  ]

  // 处理多选筛选
  const handleMultiSelectChange = useCallback(
    (key: keyof KanbanFilters, value: string, checked: boolean) => {
      const currentValues = (filters[key] as string[]) || []
      const newValues = checked
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value)
      onFiltersChange({ [key]: newValues })
    },
    [filters, onFiltersChange]
  )

  // 计算活跃筛选条件数量
  const activeFiltersCount = (
    (filters.priority?.length || 0) +
    (filters.label?.length || 0) +
    (filters.assignee?.length || 0) +
    (filters.dueDate ? 1 : 0) +
    (filters.search ? 1 : 0)
  )

  return (
    <Card className={cn('mb-6', className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* 搜索栏和基础操作 */}
          <div className="flex items-center gap-3">
            {/* 搜索输入框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜索任务标题..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 高级筛选切换 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={cn(
                'gap-2',
                activeFiltersCount > 0 && 'border-primary text-primary'
              )}
            >
              <Filter className="h-4 w-4" />
              筛选
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* 清除筛选 */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
                清除
              </Button>
            )}
          </div>

          {/* 高级筛选面板 */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              {/* 优先级筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  优先级
                </label>
                <div className="space-y-2">
                  {priorityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priority?.includes(option.value) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('priority', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`priority-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 标签筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  标签
                </label>
                <div className="space-y-2">
                  {labelOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`label-${option.value}`}
                        checked={filters.label?.includes(option.value) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('label', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`label-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 负责人筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  负责人
                </label>
                <div className="space-y-2">
                  {assigneeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`assignee-${option.value}`}
                        checked={filters.assignee?.includes(option.value) || false}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange('assignee', option.value, checked as boolean)
                        }
                      />
                      <label
                        htmlFor={`assignee-${option.value}`}
                        className="text-sm cursor-pointer"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* 截止日期筛选 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  截止日期
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dueDate && 'text-muted-foreground'
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {filters.dueDate
                        ? (filters.dueDate.from || filters.dueDate.to)?.toLocaleDateString('zh-CN') || '选择日期'
                        : '选择日期'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={filters.dueDate?.from || filters.dueDate?.to}
                      onSelect={(date) => onFiltersChange({ dueDate: date ? { from: date, to: date } : undefined })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* 活跃筛选条件显示 */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.search && (
                <Badge variant="secondary" className="gap-1">
                  搜索: {filters.search}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      setSearchValue('')
                      onFiltersChange({ search: '' })
                    }}
                  />
                </Badge>
              )}
              
              {filters.priority?.map((priority) => (
                <Badge key={priority} variant="secondary" className="gap-1">
                  优先级: {t(`tasks.priority.${priority}`)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleMultiSelectChange('priority', priority, false)}
                  />
                </Badge>
              ))}
              
              {filters.label?.map((label) => (
                <Badge key={label} variant="secondary" className="gap-1">
                  标签: {t(`tasks.labels.${label}`)}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleMultiSelectChange('label', label, false)}
                  />
                </Badge>
              ))}
              
              {filters.assignee?.map((assignee) => (
                <Badge key={assignee} variant="secondary" className="gap-1">
                  负责人: {assignee}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleMultiSelectChange('assignee', assignee, false)}
                  />
                </Badge>
              ))}
              
              {filters.dueDate && (
                <Badge variant="secondary" className="gap-1">
                  截止日期: {(filters.dueDate.from || filters.dueDate.to)?.toLocaleDateString('zh-CN')}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => onFiltersChange({ dueDate: undefined })}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}