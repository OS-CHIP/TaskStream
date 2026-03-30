import { createFileRoute } from '@tanstack/react-router'
import SimpleCacheTest from '@/pages/simple-cache-test'

export const Route = createFileRoute('/_authenticated/simple-cache-test')({
  component: SimpleCacheTest,
})