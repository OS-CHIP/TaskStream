import { useNavigate } from '@tanstack/react-router'
import { Template } from '@/types/templates'
import { useTemplates } from '@/hooks/useTemplates'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { TemplateSelector } from './components/TemplateSelector'

export function TemplateSelect() {
  const { templates } = useTemplates()
  const navigate = useNavigate()

  const handleTemplateSelect = (template: Template) => {
    navigate({
      from: '/templates/select',
      to: '/instance/create',
      search: { templateId: template.id },
    })
  }
  const topNavLinks = [
    {
      title: '',
      href: '/templates/select',
      isActive: true,
      disabled: false,
    },
  ]

  return (
    <div className='flex h-screen flex-col'>
      <AppHeader>
        <TopNav links={topNavLinks} />
      </AppHeader>

      <Main fixed className='flex-1'>
        <TemplateSelector
          class-name='overflow-auto'
          templates={templates}
          onSelect={handleTemplateSelect}
        />
      </Main>
    </div>
  )
}
