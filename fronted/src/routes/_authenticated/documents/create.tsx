import { createFileRoute } from '@tanstack/react-router'
import { DocumentFormPage } from '@/features/documents/components/document-form-page'

export const Route = createFileRoute('/_authenticated/documents/create')({
  component: () => <DocumentFormPage mode="create" />,
})