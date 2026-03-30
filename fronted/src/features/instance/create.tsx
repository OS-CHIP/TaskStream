import React from 'react'
import { useLocation } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'
import { Instance } from '@/types/instance'
import { useTemplates } from '@/hooks/useTemplates'
import { AppHeader } from '@/components/layout/app-header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { InstanceCreator } from './components/Creator/Creator'

export const InstanceCreate: React.FC = () => {
  const navigate = useNavigate()
  //  useLocation 可以获取到 location.state
  const location = useLocation()
  const stateData = location.state as { templateId?: string }
  const templateId = stateData.templateId
  const { templates } = useTemplates()
  const template = templates.find((t) => t.id === templateId)
  const handleSuccess = (instance: Instance) => {
    // eslint-disable-next-line no-console
    console.log('实例创建成功:', instance)
    // navigate('/instances')
  }
  const handleCancel = () => {
    // eslint-disable-next-line no-console
    console.log('取消实例创建')
    navigate({
      from: '/instance/create',
      to: '/templates/select',
    })
  }

  const handleSaveDraft = (formData: unknown) => {
    // eslint-disable-next-line no-console
    console.log('保存草稿:', formData)
    // 这里可以保存到localStorage或发送到后端
  }
  const topNavLinks = [
    {
      title: '',
      href: '/templates/create',
      isActive: true,
      disabled: false,
    },
  ]

  if (!template) {
    return <div>模板不存在</div>
  }

  return (
    <div className='flex h-screen flex-col'>
      <AppHeader>
        <TopNav links={topNavLinks} />
      </AppHeader>

      <Main fixed className='flex-1'>
        <InstanceCreator
          template={template}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          onSaveDraft={handleSaveDraft}
          mode='page'
          className='overflow-auto'
        />
      </Main>
    </div>
  )
}
