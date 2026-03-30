import { createFileRoute } from '@tanstack/react-router'
import InputColorPage from './index.tsx'

export const Route = createFileRoute('/_authenticated/input-color')({
  component: InputColorPage,
})

