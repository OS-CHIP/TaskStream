import { IconLoader } from '@tabler/icons-react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FormControl } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

interface SelectDropdownProps {
  onValueChange?: (value: string) => void
  defaultValue?: string | number | undefined
  value?: string | number | undefined
  placeholder?: string
  isPending?: boolean
  items: { label: string; value: string | number }[] | undefined
  disabled?: boolean
  className?: string
  isControlled?: boolean
  allowClear?: boolean
  embedFormControl?: boolean
}

export function SelectDropdown({
  defaultValue,
  value,
  onValueChange,
  isPending,
  items,
  placeholder,
  disabled,
  className = '',
  isControlled = false,
  allowClear = false,
  embedFormControl = true,
}: SelectDropdownProps) {
  // 在受控模式下使用 value，非受控模式下使用 defaultValue
  const currentValue = isControlled ? value : defaultValue
  // 将当前值转换为字符串以匹配 Select 组件的要求
  const stringCurrentValue = currentValue !== undefined ? String(currentValue) : undefined
  
  const selectProps = isControlled
    ? { value: stringCurrentValue, onValueChange }
    : { defaultValue: stringCurrentValue, onValueChange }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.('')
  }

  const showClearButton = allowClear && stringCurrentValue && !disabled

  return (
    <Select {...selectProps}>
      {embedFormControl ? (
        <FormControl>
          <SelectTrigger disabled={disabled} className={cn('relative', className)}>
            <SelectValue placeholder={placeholder ?? 'Select'} />
            {showClearButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-8 h-4 w-4 p-0 hover:bg-transparent"
                onClick={handleClear}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </SelectTrigger>
        </FormControl>
      ) : (
        <SelectTrigger disabled={disabled} className={cn('relative', className)}>
          <SelectValue placeholder={placeholder ?? 'Select'} />
          {showClearButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-8 h-4 w-4 p-0 hover:bg-transparent"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </SelectTrigger>
      )}
      <SelectContent>
        {isPending ? (
          <SelectItem disabled value='loading' className='h-14'>
            <div className='flex items-center justify-center gap-2'>
              <IconLoader className='h-5 w-5 animate-spin' />
              {'  '}
              Loading...
            </div>
          </SelectItem>
        ) : (
          items?.map(({ label, value }) => (
            <SelectItem key={String(value)} value={String(value)}>
              {label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
