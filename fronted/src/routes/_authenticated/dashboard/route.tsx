import { createFileRoute } from '@tanstack/react-router'
import DashboardHome from './index.tsx'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardHome,
})
