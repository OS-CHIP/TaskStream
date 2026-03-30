import * as React from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface DocumentSearchProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  debounceMs?: number
}

export function DocumentSearch({
  value = '',
  onChange,
  placeholder = '搜索文档标题、描述或作者...',
  className,
  debounceMs = 300,
}: DocumentSearchProps) {
  const [searchValue, setSearchValue] = React.useState(value)
  const debounceRef = React.useRef<NodeJS.Timeout | null>(null)

  // 同步外部value变化
  React.useEffect(() => {
    setSearchValue(value)
  }, [value])

  // 防抖处理
  React.useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      onChange?.(searchValue)
    }, debounceMs)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchValue, onChange, debounceMs])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value)
  }

  const handleClear = () => {
    setSearchValue('')
  }

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        className="pl-10 pr-4"
      />
      {searchValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

// 搜索结果高亮组件
interface SearchHighlightProps {
  text: string
  searchTerm: string
  className?: string
}

export function SearchHighlight({
  text,
  searchTerm,
  className,
}: SearchHighlightProps) {
  if (!searchTerm.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = regex.test(part)
        return isMatch ? (
          <mark
            key={index}
            className="bg-yellow-200 text-yellow-900 px-0.5 rounded"
          >
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      })}
    </span>
  )
}

// 搜索建议组件
interface SearchSuggestionsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
  className?: string
}

export function SearchSuggestions({
  suggestions,
  onSelect,
  className,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-md shadow-md',
        className
      )}
    >
      <div className="p-2">
        <div className="text-xs text-muted-foreground mb-2">搜索建议</div>
        <div className="space-y-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(suggestion)}
              className="w-full text-left px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}