import logoUrl from '@/assets/logo.svg'
import { LanguageSwitch } from '@/components/language-switch'

interface Props {
  children: React.ReactNode
}

export default function AuthLayout({ children }: Props) {
  return (
    <div className='bg-primary-foreground container grid h-svh max-w-none items-center justify-center relative'>
      <div className='absolute right-4 top-4'>
        <LanguageSwitch />
      </div>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex items-center justify-center'>
          <img src={logoUrl} alt='Logo' className='h-8 w-auto' />
        </div>
        {children}
      </div>
    </div>
  )
}