import { createFileRoute } from '@tanstack/react-router'
import { InstanceCreate } from '@/features/instance/create'

export const Route = createFileRoute('/_authenticated/instance/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className='instance-create-page'>
      <InstanceCreate />
    </div>
  )
}
