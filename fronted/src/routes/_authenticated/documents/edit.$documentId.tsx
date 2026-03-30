import { createFileRoute } from '@tanstack/react-router'
import { DocumentFormPage } from '@/features/documents/components/document-form-page'

export const Route = createFileRoute('/_authenticated/documents/edit/$documentId')({
  component: () => <DocumentFormPage mode="edit" />,
})