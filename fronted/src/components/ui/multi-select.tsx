import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

interface MultiSelectProps {
  options: { label: string; value: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
  triggerClassName?: string
  maxVisible?: number
  badgeClassName?: string
  disableRemoveValues?: string[]
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  disabled = false,
  triggerClassName,
  maxVisible = 2,
  badgeClassName,
  disableRemoveValues = [],
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between items-center", triggerClassName ?? "min-h-10 h-auto")}
          disabled={disabled}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selected.length > 0 ? (
              (() => {
                const visible = selected.slice(0, maxVisible)
                const hiddenCount = selected.length - visible.length
                return (
                  <>
                  {visible.map((val) => {
                    const option = options.find((opt) => opt.value === val)
                    const removable = !disableRemoveValues.includes(val)
                    return (
                      <Badge
                        key={val}
                        variant="secondary"
                        className={cn("mr-1 px-1 py-0 text-xs max-w-[100px] truncate", badgeClassName)}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (removable) {
                            handleRemove(val)
                          }
                        }}
                      >
                        {option?.label || val}
                        {removable && (
                          <X className="ml-1 h-3 w-3 text-muted-foreground hover:text-foreground cursor-pointer" />
                        )}
                      </Badge>
                    )
                  })}
                    {hiddenCount > 0 && (
                      <Badge variant="secondary" className="px-1 py-0 text-xs">+{hiddenCount}</Badge>
                    )}
                  </>
                )
              })()
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 self-center" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Using label for search
                  onSelect={() => {
                    handleSelect(option.value)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
