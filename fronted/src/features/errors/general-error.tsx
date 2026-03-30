import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface GeneralErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function GeneralError({
  className,
  minimal = false,
}: GeneralErrorProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] leading-tight font-bold'>
            {t('errors.internalServerError.title')}
          </h1>
        )}
        <span className='font-medium'>{t('errors.internalServerError.message')}</span>
        <p className='text-muted-foreground text-center'>
          {t('errors.internalServerError.description')}
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              {t('common.goBack')}
            </Button>
            <Button onClick={() => navigate({ to: '/' })}>
              {t('common.backToHome')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
