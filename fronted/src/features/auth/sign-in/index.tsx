import ViteLogo from '@/assets/logo.svg'
import { UserAuthForm } from './components/user-auth-form'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { AuthLanguageSwitch } from './components/auth-language-switch'
import { Sparkles } from '@/components/ui/sparkles'
import '@/features/auth/i18n/register'

export default function SignIn() {
  const { t } = useTranslation()

  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='absolute right-4 top-4 z-50'>
        <AuthLanguageSwitch />
      </div>
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-zinc-900' />
        <Sparkles
          className='absolute inset-0'
          particleColor='#ffffff'
          particleDensity={150}
          speed={2}
          minSize={0.4}
          maxSize={1.2}
        />
        <img
          src={ViteLogo}
          className='relative m-auto z-10'
          width={301}
          height={60}
          alt='Logo'
        />
      </div>
      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px]'>
          <div className='flex flex-col space-y-2 text-left'>
            <h1 className='text-2xl font-semibold tracking-tight'>
              {t('auth.signIn.title')}
            </h1>
            <p className='text-muted-foreground text-sm'>
              {t('auth.signIn.subtitle')}
            </p>
          </div>
          <UserAuthForm />
          <div className='text-muted-foreground mt-3 text-center text-sm'>
            <span className='mr-1'>{t ? t('auth.signIn.haveNoAccount') ?? "Don't have an account?" : "Don't have an account?"}</span>
            <Link to='/sign-up' className='hover:text-primary font-medium'>
              {t ? t('navigation.signUp') : 'Sign Up'}
            </Link>
          </div>
          {/* <p className='text-muted-foreground px-8 text-center text-sm'>
            By clicking login, you agree to our{' '}
            <a
              href='/terms'
              className='hover:text-primary underline underline-offset-4'
            >
              Terms of Service
            </a>{' '}
            and{' '}
            <a
              href='/privacy'
              className='hover:text-primary underline underline-offset-4'
            >
              Privacy Policy
            </a>
            .
          </p> */}
        </div>
      </div>
    </div>
  )
}