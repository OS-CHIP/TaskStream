import { useTranslation } from 'react-i18next'
import ContentSection from '../components/content-section'
import { PasswordForm } from './password-form'

export default function SettingsPassword() {
  const { t } = useTranslation()
  return (
    <ContentSection
      title={t('settings.password.title', { defaultValue: 'Change Password' })}
      desc={t('settings.password.description', { defaultValue: 'Update your account password' })}
    >
      <PasswordForm />
    </ContentSection>
  )
}