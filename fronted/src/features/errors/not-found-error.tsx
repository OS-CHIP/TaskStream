import { useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export default function NotFoundError() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { history } = useRouter()
  return (
    <div className='h-svh'>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        <h1 className='text-[7rem] leading-tight font-bold'>
          {t('errors.notFound.title')}
        </h1>
        <span className='font-medium'>{t('errors.notFound.message')}</span>
        <p className='text-muted-foreground text-center'>
          {t('errors.notFound.description')}
        </p>
        <div className='mt-6 flex gap-4'>
          <Button variant='outline' onClick={() => history.go(-1)}>
            {t('common.goBack')}
          </Button>
          <Button onClick={() => navigate({ to: '/' })}>
            {t('common.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
