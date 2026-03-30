import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { IconLanguage, IconChevronDown, IconCheck } from '@tabler/icons-react'

export function AuthLanguageSwitch() {
  const { i18n } = useTranslation()
  const current = useMemo(() => (i18n.language?.startsWith('zh') ? 'zh' : 'en'), [i18n.language])

  const options = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'zh', label: '中文', short: '中文' },
  ] as const

  const onChange = (code: 'en' | 'zh') => {
    if (code === current) return
    i18n.changeLanguage(code)
    try {
      localStorage.setItem('i18nextLng', code)
    } catch {
      // ignore localStorage errors
    }
    document.documentElement.lang = code
  }

  const cur = options.find(o => o.code === current)!

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full shadow-sm bg-background/80 backdrop-blur border-muted hover:bg-background"
        >
          <IconLanguage size={16} className="mr-2" />
          <span className="font-medium">{cur.short}</span>
          <IconChevronDown size={16} className="ml-1 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-36">
        {options.map(opt => (
          <DropdownMenuItem
            key={opt.code}
            onClick={() => onChange(opt.code)}
            className="flex items-center justify-between"
          >
            <span>{opt.label}</span>
            {opt.code === current ? <IconCheck size={16} /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}