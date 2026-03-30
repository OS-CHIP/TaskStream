import { useCallback, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 简单的防抖函数实现
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = '搜索任务...',
  className
}: SearchInputProps) {
  // 防抖搜索，300ms延迟
  const debouncedOnChange = useMemo(
    () => debounce((query: unknown) => {
      onChange(query as string)
    }, 300),
    [onChange]
  )

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    debouncedOnChange(newValue)
  }, [debouncedOnChange])

  // 清空搜索
  const handleClear = useCallback(() => {
    onChange('')
  }, [onChange])

  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Escape 键清空搜索
    if (e.key === 'Escape') {
      handleClear()
    }
  }, [handleClear])

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
          <span className="sr-only">清空搜索</span>
        </Button>
      )}
    </div>
  )
}