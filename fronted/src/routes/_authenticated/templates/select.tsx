import { createFileRoute } from '@tanstack/react-router'
import { TemplateSelect } from '@/features/templates/select'

function TemplateManagementComponent() {
  return (
    <div className='create-instance-page'>
      <TemplateSelect />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/templates/select')({
  component: TemplateManagementComponent,
})
