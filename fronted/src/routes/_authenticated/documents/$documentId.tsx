import { createFileRoute } from '@tanstack/react-router'
import { DocumentViewPage } from '@/features/documents/components/document-view-page'

export const Route = createFileRoute('/_authenticated/documents/$documentId')({  
  component: DocumentViewPage,
})