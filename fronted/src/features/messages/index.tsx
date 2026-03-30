import { useEffect, useMemo, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Bell, CheckCheck, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_MESSAGES, type Message, type MessageCategory } from "./data/mock"
import { noticeService } from '@/features/notifications/services/notice-service'
import type { QueryMyNoticeRequest } from '@/features/notifications/services/notice-service'
import { Header } from '@/components/layout/header'
import { Search } from '@/components/search'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Main } from '@/components/layout/main'
import { NotificationBell } from '@/components/notification-bell'
import { useTranslation } from 'react-i18next'

type TabKey = "all" | "announcement" | "reminder" | "unread" | "history"

const STORAGE_KEY = "messages-center:v1"

function mapNoticeTypeToCategory(t: 1 | 2): MessageCategory {
  return t === 1 ? 'announcement' : 'reminder'
}

function toIso(ts: string) {
  return new Date(ts.replace(' ', 'T')).toISOString()
}


function formatTime(ts: string) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${m}-${day} ${hh}:${mm}`
}

function usePersistentMessages(tab: TabKey) {
  const [messages, setMessages] = useState<Message[] | null>(null)
  const [pageNum, setPageNum] = useState(1)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (saved) {
      setMessages(JSON.parse(saved))
    } else {
      setMessages(MOCK_MESSAGES)
    }
  }, [])

  useEffect(() => {
    if (messages) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
      const unreadCount = messages.filter((m) => !m.read).length
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('messages:update', { detail: { unreadCount } }))
      }
    }
  }, [messages])

  useEffect(() => {
    const fetchFirst = async () => {
      try {
        setLoading(true)
        const params: QueryMyNoticeRequest = { page: '1', size: '20' }
        if (tab === 'unread') params.isRead = false
        if (tab === 'history') params.isRead = true
        if (tab === 'announcement') params.type = 1
        if (tab === 'reminder') params.type = 2
        const res = await noticeService.queryMyNotices(params)
        const list = (res.list || []).map(m => ({
          id: String(m.id),
          title: m.title,
          content: m.summary ?? m.title,
          category: mapNoticeTypeToCategory(m.type),
          type: m.type,
          tags: m.jumpUrl ? ['link'] : undefined,
          createdAt: toIso(m.createTime),
          read: !!m.isRead,
          severity: undefined,
        })) as Message[]
        setMessages(list)
        setPageNum(1)
        setHasNext(!!res.hasNext)
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchFirst()
  }, [tab])

  const loadMore = async () => {
    if (loading || !hasNext) return
    const nextPage = pageNum + 1
    try {
      setLoading(true)
      const params: QueryMyNoticeRequest = { page: String(nextPage), size: '20' }
      if (tab === 'unread') params.isRead = false
      if (tab === 'history') params.isRead = true
      if (tab === 'announcement') params.type = 1
      if (tab === 'reminder') params.type = 2
      const res = await noticeService.queryMyNotices(params)
      const list = (res.list || []).map(m => ({
        id: String(m.id),
        title: m.title,
        content: m.summary ?? m.title,
        category: mapNoticeTypeToCategory(m.type),
        type: m.type,
        tags: m.jumpUrl ? ['link'] : undefined,
        createdAt: toIso(m.createTime),
        read: !!m.isRead,
        severity: undefined,
      })) as Message[]
      setMessages(prev => (prev ? [...prev, ...list] : list))
      setPageNum(nextPage)
      setHasNext(!!res.hasNext)
    } finally {
      setLoading(false)
    }
  }

  return { messages, setMessages, hasNext, loadMore, loading }
}

function categoryStyle(cat: MessageCategory) {
  switch (cat) {
    case "announcement":
      return {
        border: "border-emerald-300",
        bg: "bg-emerald-50/50",
        tag: "bg-emerald-100 text-emerald-700",
      }
    case "reminder":
      return {
        border: "border-amber-300",
        bg: "bg-amber-50/50",
        tag: "bg-amber-100 text-amber-700",
      }
    case "warning":
      return {
        border: "border-rose-300",
        bg: "bg-rose-50/50",
        tag: "bg-rose-100 text-rose-700",
      }
    default:
      return {
        border: "border-slate-300",
        bg: "bg-slate-50/50",
        tag: "bg-slate-100 text-slate-700",
      }
  }
}

export default function MessagesPage() {
  const [tab, setTab] = useState<TabKey>("all")
  const { messages, setMessages, hasNext, loadMore, loading } = usePersistentMessages(tab)
  const [marking, setMarking] = useState(false)
  const { t } = useTranslation()

  const filtered = useMemo(() => {
    if (!messages) return []
    if (tab === "all") return messages
    if (tab === "unread") return messages.filter((m) => !m.read)
    if (tab === "history") return messages.filter((m) => m.read)
    return messages.filter((m) => m.category === tab)
  }, [messages, tab])

  const unread = useMemo(() => (messages ? messages.filter((m) => !m.read).length : 0), [messages])

  async function markAllRead() {
    if (!messages || marking) return
    try {
      setMarking(true)
      await noticeService.markAllRead()
      const next = messages.map((m) => ({ ...m, read: true }))
      setMessages(next)
      toast.success(t('messages.toast.markAllReadSuccess'))
    } catch (e: any) {
      toast.error(e?.message || t('messages.toast.markAllReadError'))
    } finally {
      setMarking(false)
    }
  }

  function clearAll() {
    setMessages([])
    toast.success(t('messages.toast.clearSuccess'))
  }

  function updateOne(id: string, patch: Partial<Message>) {
    if (!messages) return
    const next = messages.map((m) => (m.id === id ? { ...m, ...patch } : m))
    setMessages(next)
  }

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>
      <Main className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-6 md:px-6 lg:px-8">
      <header className="sticky top-0 z-10 mb-4 rounded-xl border bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Bell className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-lg font-semibold leading-tight">{t('messages.title')}</h1>
              <p className="text-xs text-muted-foreground">{t('messages.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="gap-2"
                onClick={markAllRead}
                disabled={!messages || unread === 0 || marking}
              >
                <CheckCheck className="h-4 w-4" />
                {t('messages.actions.markAllRead')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                asChild
              >
                <a href="/send-notice">
                  {t('messages.actions.sendNotice')}
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="gap-2 border-rose-200 text-rose-600 hover:bg-rose-50" disabled={!messages || messages.length === 0}>
                    <Trash2 className="h-4 w-4" />
                    {t('messages.actions.clearAll')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('messages.confirmClear.title')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('messages.confirmClear.desc')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('messages.confirmClear.cancel')}</AlertDialogCancel>
                    <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={clearAll}>
                      {t('messages.confirmClear.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
        </div>

        <div className="border-t">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList className="mx-4 my-3 grid w-[min(720px,100%)] grid-cols-5 rounded-full bg-muted/60 p-1">
              <TabsTrigger className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow" value="all">
                {t('messages.tabs.all')}
              </TabsTrigger>
              <TabsTrigger className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow" value="announcement">
                {t('messages.tabs.system')}
              </TabsTrigger>
              <TabsTrigger className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow" value="reminder">
                {t('messages.tabs.event')}
              </TabsTrigger>
              <TabsTrigger className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow" value="history">
                {t('messages.tabs.history')}
              </TabsTrigger>
              <TabsTrigger className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow" value="unread">
                {t('messages.tabs.unread')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <section aria-live="polite" className="rounded-xl border bg-white min-h-[500px] flex flex-col">
        {!messages ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <EmptyState onReset={() => localStorage.removeItem(STORAGE_KEY)} />
        ) : (
          <ScrollArea className="flex-1 h-[calc(100vh-280px)]">
            <ul className="space-y-3 p-4">
              {filtered.map((m, i) => (
                <li
                  key={m.id}
                  className="animate-in fade-in-50 slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" as const } as React.CSSProperties}
                >
                  <MessageCard
                    message={m}
                    onClick={async () => {
                      if (!m.read) {
                        updateOne(m.id, { read: true })
                        const isNumeric = /^\d+$/.test(m.id)
                        if (isNumeric) {
                          try {
                            const typeToSend: 1 | 2 = m.type ?? (m.category === 'announcement' ? 1 : 2)
                            await noticeService.markRead(Number(m.id), typeToSend)
                          } catch (e: any) {
                            updateOne(m.id, { read: false })
                            toast.error(e?.message || t('messages.toast.markReadError'))
                          }
                        }
                      }
                    }}
                  />
                </li>
              ))}
              <li className="pt-4 text-center">
                {hasNext ? (
                  <Button size="sm" variant="secondary" disabled={loading} onClick={loadMore}>
                    {t('messages.list.loadMore')}
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">{t('messages.list.noMore')}</span>
                )}
              </li>
            </ul>
          </ScrollArea>
        )}
      </section>
      </Main>
      </>
  )
}

function MessageCard({ message, onClick }: { message: Message; onClick?: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const styles = categoryStyle(message.category)
  const { t } = useTranslation()

  return (
    <Card
      role="article"
      aria-label={message.title}
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-shadow duration-200 hover:shadow-md",
        styles.border,
        styles.bg,
        message.read
          ? "opacity-90"
          : "ring-2 ring-violet-200 shadow-[0_0_0_3px_rgba(124,58,237,0.08)] border-l-4 border-l-violet-500",
      )}
    >
      <button
        type="button"
        className={cn(
          "block w-full text-left bg-transparent",
          "transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
        )}
        onClick={() => {
          setExpanded((v) => !v)
          if (onClick) {
            onClick()
          }
        }}
      >
        <div className="flex items-start gap-3 p-4">
          <div className="mt-0.5 flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              {message.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className={cn("rounded-full px-2 py-0.5 text-[10px]", styles.tag)}>
                  {tag === 'link' ? t('messages.tags.link') : tag}
                </Badge>
              ))}
              <span className={cn("line-clamp-1 text-sm font-medium", !message.read && "text-foreground")}>
                {message.title}
              </span>
              {message.severity === "urgent" && (
                <span className="ml-1 rounded-full bg-rose-600/90 px-1.5 py-0.5 text-[10px] text-white">{t('messages.badges.urgent')}</span>
              )}
              {!message.read && (
                <span className="ml-1 rounded-full bg-violet-600 px-1.5 py-0.5 text-[10px] text-white">{t('messages.badges.unread')}</span>
              )}
            </div>

            <p
              className={cn(
                "text-xs text-muted-foreground transition-all duration-200 whitespace-pre-line",
                expanded ? "line-clamp-none" : "line-clamp-3",
              )}
            >
              {message.content}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1 pl-2">
            {!message.read && (
              <span className="relative -mr-0.5 inline-flex h-2.5 w-2.5 items-center justify-center" aria-label={t('messages.aria.unreadDot')}>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-600" />
              </span>
            )}
            <time className="whitespace-nowrap text-xs text-muted-foreground">{formatTime(message.createdAt)}</time>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="text-xs text-violet-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {expanded ? t('messages.expand.collapse') : t('messages.expand.expand')}
          </div>
        </div>
      </button>
    </Card>
  )
}

function EmptyState({ onReset }: { onReset?: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center min-h-[500px]">
      <Bell className="h-8 w-8 text-muted-foreground" />
      <div className="text-sm font-medium">{t('messages.empty.title')}</div>
      <p className="max-w-[40ch] text-xs text-muted-foreground">
        {t('messages.empty.desc')}
      </p>
      <div className="pt-2">
        <Button size="sm" variant="secondary" onClick={onReset}>
          {t('messages.empty.refresh')}
        </Button>
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-in fade-in-50 slide-in-from-bottom-1" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
