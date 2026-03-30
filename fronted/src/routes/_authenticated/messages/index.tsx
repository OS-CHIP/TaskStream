import { createFileRoute } from "@tanstack/react-router"
import MessagesPage from "@/features/messages"

export const Route = createFileRoute("/_authenticated/messages/")({
  component: MessagesPage,
})