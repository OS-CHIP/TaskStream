import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DocumentType, DocumentStatus } from '../types/document'

interface FilterOption {
  label: string
  value: string
  count?: number
}

interface DocumentFilterProps {
  selectedTypes?: DocumentType[]
  selectedStatuses?: DocumentStatus[]
  selectedAuthors?: string[]
  typeOptions?: FilterOption[]
  statusOptions?: FilterOption[]
  authorOptions?: FilterOption[]
  onTypeChange?: (types: DocumentType[]) => void
  onStatusChange?: (statuses: DocumentStatus[]) => void
  onAuthorChange?: (authors: string[]) => void
  onClearAll?: () => void
  className?: string
  showBadges?: boolean
}

export function DocumentFilter({
  selectedTypes = [],
  selectedStatuses = [],
  selectedAuthors = [],
  typeOptions = [],
  statusOptions = [],
  authorOptions = [],
  onTypeChange,
  onStatusChange,
  onAuthorChange,
  onClearAll,
  className,
  showBadges = true,
}: DocumentFilterProps) {
  const hasActiveFilters = 
    selectedTypes.length > 0 || 
    selectedStatuses.length > 0 || 
    selectedAuthors.length > 0

  const activeFilterCount = selectedTypes.length + selectedStatuses.length + selectedAuthors.length

  const handleTypeToggle = (type: DocumentType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type]
    onTypeChange?.(newTypes)
  }

  const handleStatusToggle = (status: DocumentStatus) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status]
    onStatusChange?.(newStatuses)
  }

  const handleAuthorToggle = (author: string) => {
    const newAuthors = selectedAuthors.includes(author)
      ? selectedAuthors.filter(a => a !== author)
      : [...selectedAuthors, author]
    onAuthorChange?.(newAuthors)
  }

  const removeFilter = (type: 'type' | 'status' | 'author', value: string) => {
    switch (type) {
      case 'type':
        onTypeChange?.(selectedTypes.filter(t => t !== value))
        break
      case 'status':
        onStatusChange?.(selectedStatuses.filter(s => s !== value))
        break
      case 'author':
        onAuthorChange?.(selectedAuthors.filter(a => a !== value))
        break
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="mr-2 h-4 w-4" />
            筛选
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          {/* 文档类型筛选 */}
          {typeOptions.length > 0 && (
            <>
              <DropdownMenuLabel>文档类型</DropdownMenuLabel>
              {typeOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedTypes.includes(option.value as DocumentType)}
                  onCheckedChange={() => handleTypeToggle(option.value as DocumentType)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* 文档状态筛选 */}
          {statusOptions.length > 0 && (
            <>
              <DropdownMenuLabel>文档状态</DropdownMenuLabel>
              {statusOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedStatuses.includes(option.value as DocumentStatus)}
                  onCheckedChange={() => handleStatusToggle(option.value as DocumentStatus)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* 作者筛选 */}
          {authorOptions.length > 0 && (
            <>
              <DropdownMenuLabel>作者</DropdownMenuLabel>
              {authorOptions.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.value}
                  checked={selectedAuthors.includes(option.value)}
                  onCheckedChange={() => handleAuthorToggle(option.value)}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {hasActiveFilters && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearAll}>
                <X className="mr-2 h-4 w-4" />
                清除所有筛选
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 活跃筛选标签 */}
      {showBadges && hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {selectedTypes.map((type) => {
            const option = typeOptions.find(opt => opt.value === type)
            return (
              <Badge
                key={type}
                variant="secondary"
                className="text-xs h-6 pr-1"
              >
                {option?.label || type}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('type', type)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          {selectedStatuses.map((status) => {
            const option = statusOptions.find(opt => opt.value === status)
            return (
              <Badge
                key={status}
                variant="secondary"
                className="text-xs h-6 pr-1"
              >
                {option?.label || status}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('status', status)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          {selectedAuthors.map((author) => {
            const option = authorOptions.find(opt => opt.value === author)
            return (
              <Badge
                key={author}
                variant="secondary"
                className="text-xs h-6 pr-1"
              >
                {option?.label || author}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                  onClick={() => removeFilter('author', author)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
          
          {activeFilterCount > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={onClearAll}
            >
              清除全部
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// 快速筛选按钮组件
interface QuickFilterProps {
  filters: Array<{
    label: string
    value: string
    active?: boolean
  }>
  onFilterClick: (value: string) => void
  className?: string
}

export function QuickFilter({ filters, onFilterClick, className }: QuickFilterProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={filter.active ? 'default' : 'outline'}
          size="sm"
          className="h-8"
          onClick={() => onFilterClick(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
