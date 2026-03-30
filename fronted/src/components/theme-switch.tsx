import { useEffect } from 'react'
import { IconCheck, IconMoon, IconSun, IconPalette } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/context/theme-context'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  /* Update theme-color meta tag
   * when theme is updated */
  useEffect(() => {
    let themeColor = '#fff'
    switch (theme) {
      case 'dark':
        themeColor = '#020817'
        break
      case 'blue':
        themeColor = '#fafbfe'
        break
      case 'green':
        themeColor = '#fafefb'
        break
      case 'purple':
        themeColor = '#fbfafe'
        break
      case 'orange':
        themeColor = '#fefbfa'
        break
      default:
        themeColor = '#fff'
    }
    const metaThemeColor = document.querySelector("meta[name='theme-color']")
    if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor)
  }, [theme])

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='scale-95 rounded-full'>
          <IconSun className='size-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90' />
          <IconMoon className='absolute size-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0' />
          <span className='sr-only'>Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <IconSun size={16} className='mr-2' />
          Light
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'light' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <IconMoon size={16} className='mr-2' />
          Dark
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'dark' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <IconPalette size={16} className='mr-2' />
          System
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'system' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('blue')}>
          <div className='mr-2 h-4 w-4 rounded-full bg-blue-500' />
          Blue
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'blue' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('green')}>
          <div className='mr-2 h-4 w-4 rounded-full bg-green-500' />
          Green
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'green' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('purple')}>
          <div className='mr-2 h-4 w-4 rounded-full bg-purple-500' />
          Purple
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'purple' && 'hidden')}
          />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('orange')}>
          <div className='mr-2 h-4 w-4 rounded-full bg-orange-500' />
          Orange
          <IconCheck
            size={14}
            className={cn('ml-auto', theme !== 'orange' && 'hidden')}
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
