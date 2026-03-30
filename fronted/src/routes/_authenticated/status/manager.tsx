import { createFileRoute } from '@tanstack/react-router'
import { StatusManagement } from '@/features/status/management'

function RouteComponent() {
  return (
    <div className='bg-background min-h-screen'>
      <StatusManagement />
    </div>
  )
}

export const Route = createFileRoute('/_authenticated/status/manager')({
  component: RouteComponent,
})
