import { useState, KeyboardEvent, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { Input } from './input'
import { Badge } from './badge'
import { cn } from '@/lib/cn'

interface TagInputProps {
  value?: string[]
  onChange?: (tags: string[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  fetchSuggestions?: (keyword: string) => Promise<string[]>
}

export function TagInput({
  value = [],
  onChange,
  placeholder = '输入标签后按回车添加',
  className,
  disabled = false,
  fetchSuggestions
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isSelectingSuggestionRef = useRef(false)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setInputValue(val)

    if (!fetchSuggestions) return

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    if (!val.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const results = await fetchSuggestions(val)
        // Filter out already selected tags
        const filteredResults = results.filter(tag => !value.includes(tag))
        setSuggestions(filteredResults)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setIsLoading(false)
      }
    }, 300)
  }

  const handleSelectSuggestion = (tag: string) => {
    if (!value.includes(tag)) {
      const newTags = [...value, tag]
      onChange?.(newTags)
      setInputValue('')
      setSuggestions([])
      setShowSuggestions(false)
    }
    isSelectingSuggestionRef.current = false
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmedValue = inputValue.trim()
      
      if (trimmedValue && !value.includes(trimmedValue)) {
        const newTags = [...value, trimmedValue]
        onChange?.(newTags)
        setInputValue('')
        setSuggestions([])
        setShowSuggestions(false)
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // 当输入框为空且按下退格键时，删除最后一个标签
      const newTags = value.slice(0, -1)
      onChange?.(newTags)
    }
  }

  const removeTag = (indexToRemove: number) => {
    const newTags = value.filter((_, index) => index !== indexToRemove)
    onChange?.(newTags)
  }

  return (
    <div className="relative" ref={wrapperRef} data-slot="tag-input">
      <div className={cn(
        'flex flex-wrap items-center gap-2 min-h-[40px] p-2 border border-input rounded-md bg-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}>
        {/* 显示已添加的标签 */}
        {value.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-xs"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                aria-label={`删除标签 ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        
        {/* 输入框 */}
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // 如果正在选择下拉建议，则跳过失焦自动添加
            if (isSelectingSuggestionRef.current) {
              return
            }
            const trimmedValue = inputValue.trim()
            if (trimmedValue && !value.includes(trimmedValue)) {
              const newTags = [...value, trimmedValue]
              onChange?.(newTags)
            }
            setInputValue('')
            setSuggestions([])
            setShowSuggestions(false)
          }}
          onFocus={() => {
            if (inputValue.trim() && suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          className="flex-1 min-w-[120px] border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      </div>

      {/* 下拉建议列表 */}
      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md outline-none animate-in fade-in-0 zoom-in-95">
          {isLoading ? (
            <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              加载中...
            </div>
          ) : (
            <div className="max-h-[200px] overflow-y-auto py-1">
              {suggestions.length > 0 ? (
                suggestions.map((tag, index) => (
                  <div
                    key={index}
                    onMouseDown={() => { isSelectingSuggestionRef.current = true }}
                    onClick={() => handleSelectSuggestion(tag)}
                    className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer mx-1"
                  >
                    {tag}
                  </div>
                ))
              ) : (
                 <div className="px-2 py-1.5 text-sm text-muted-foreground text-center">
                   无匹配标签
                 </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
