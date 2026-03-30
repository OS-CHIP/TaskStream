import { createFileRoute } from '@tanstack/react-router'
import { TemplateDetailPage } from '@/features/templates/components/template-detail-page'

export const Route = createFileRoute('/_authenticated/templates/detail/$taskTypeId')({
  component: TemplateDetailPage,
})