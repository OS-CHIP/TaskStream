import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ViteLogo from '@/assets/logo.svg'
import { AuthLanguageSwitch } from '../sign-in/components/auth-language-switch'
import { ForgotPasswordForm } from './components/forgot-password-form'
import { useTranslation } from 'react-i18next'
import '@/features/auth/i18n/forgot-password'

export default function ForgotPassword() {
  const { t } = useTranslation()

  return (
    <div className='relative container grid h-svh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <div className='absolute right-4 top-4 z-50'>
        <AuthLanguageSwitch />
      </div>

      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-zinc-900' />
        <img
          src={ViteLogo}
          className='relative m-auto'
          width={301}
          height={60}
          alt='Logo'
        />
      </div>

      <div className='lg:p-8'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-2 sm:w-[480px]'>
          <Card className='gap-4'>
            <CardHeader>
              <CardTitle className='text-lg tracking-tight'>
                {t('navigation.forgotPassword')}
              </CardTitle>
              <CardDescription>
                {t('auth.forgotPassword.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ForgotPasswordForm />
            </CardContent>
            <CardFooter>
              <p className='text-muted-foreground mx-auto px-8 text-center text-sm text-balance'>
                {t('auth.forgotPassword.noAccount')}{' '}
                <Link
                  to='/sign-up'
                  className='hover:text-primary underline underline-offset-4'
                >
                  {t('navigation.signUp')}
                </Link>
                .
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}