import { useEffect, useMemo, useState } from 'react'
import { LanguageSwitch } from '@/components/language-switch'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notification-bell'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { projectsService } from './services/projects.service'
import type { Project, Status } from './types'
import { ListToolbar } from './components/list-toolbar'
import { ProjectCard } from './components/project-card'
import { ProjectForm, type ProjectFormValues } from './components/project-form'
import { SubprojectForm, type SubprojectFormValues } from './components/subproject-form'
import { LinkProjectsDialog } from './components/link-projects-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { RefreshCountdownDialog } from '@/components/refresh-countdown-dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { containerEnter } from './utils/animations'
import { projectsCacheManager } from '@/components/layout/project-switcher/use-projects-query'
import { useNavigate } from '@tanstack/react-router'
// 注册本模块 i18n 资源
import '@/features/projects/i18n/register'

export default function Projects() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // 查询与分页
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<Status>('1') // 默认显示可见项目
  const [page, setPage] = useState(1)
  const pageSize = 12

  // 数据
  const [items, setItems] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  // 对话框状态
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false)
  const [subCreateOpen, setSubCreateOpen] = useState(false)
  const [subParent, setSubParent] = useState<Project | null>(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkChildId, setLinkChildId] = useState<string>('')

  // 加载列表
  useEffect(() => {
    let alive = true
    setLoading(true)
    projectsService
      .list({
        q: q || undefined,
        status, // 使用当前选择的status
        page,
        pageSize,
        sortBy: 'updatedAt',
        order: 'desc',
      })
      .then((res) => {
        if (!alive) return
        setItems(res.items)
        setTotal(res.total)
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e)
        toast.error(t('projects.toast.loadFailed'))
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [q, status, page, t])

  // 创建
  const handleCreate = async (values: ProjectFormValues) => {
    setSubmitting(true)
    try {
      await projectsService.create({
        projectName: values.projectName,
        description: values.description,
        status: values.status,
      })
      toast.success(t('projects.toast.createSuccess'))
      setCreateOpen(false)
      
      // 清除项目缓存，让左侧菜单项目列表自动更新
      projectsCacheManager.clearCache()
      
      // 显示倒计时刷新对话框
      setRefreshDialogOpen(true)
    } catch (e: unknown) {
      const error = e as { message?: string }
      toast.error(error.message || t('projects.toast.createFailed'))
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  // 创建子项目
  const handleCreateSubproject = async (values: SubprojectFormValues) => {
    if (!subParent) return
    setSubmitting(true)
    try {
      const assigneeDisplay = values.assigneeName && values.assigneeName.trim() ? values.assigneeName : values.assigneeId
      const extra = `负责人: ${assigneeDisplay}\n父项目: ${subParent.name}(${subParent.id})`
      const oaDescription = `发起OA创建子项目。\n${extra}`
      const now = new Date()
      const due = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      await projectsService.createSubProjectOa({
        projectParentId: subParent.id,
        projectName: values.projectName,
        description: oaDescription,
        projectDescription: values.description || '',
        startTime: now,
        dueDate: due,
        priority: '1',
      })
      toast.success(t('projects.toast.createSuccess'))
      setSubCreateOpen(false)
      setSubParent(null)
      projectsCacheManager.clearCache()
      setRefreshDialogOpen(true)
    } catch (e: unknown) {
      const error = e as { message?: string }
      toast.error(error.message || t('projects.toast.createFailed'))
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  // 刷新页面
  const handleRefreshPage = () => {
    // 重新加载项目列表
    setPage(1)
    setQ('')
    // 触发数据重新加载
    window.location.reload()
  }

  // 编辑
  const handleEdit = async (values: ProjectFormValues) => {
    if (!editing) return
    setSubmitting(true)
    try {
      const updated = await projectsService.update(editing.id, {
        name: values.projectName,
        description: values.description,
        status: (values.status ?? '1') as Status,
        // visibility: values.status === '1' ? 'private' : 'internal', // API 不支持此字段
      })
      toast.success(t('projects.toast.saveSuccess'))
      setEditOpen(false)
      setEditing(null)
      // 更新本地
      setItems((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    } catch (e) {
      toast.error(t('projects.toast.saveFailed'))
      throw e
    } finally {
      setSubmitting(false)
    }
  }

  // 删除
  const handleDelete = async () => {
    if (!deleting) return
    setSubmitting(true)
    try {
      await projectsService.delete(deleting.id)
      toast.success('项目删除成功')
      setConfirmOpen(false)
      
      // 清除项目缓存，让左侧菜单项目列表自动更新
      projectsCacheManager.clearCache()
      
      // 删除成功后从本地状态中移除该项目
      setItems((prev) => prev.filter((p) => p.id !== deleting.id))
    } catch (e: unknown) {
      const error = e as { message?: string }
      // eslint-disable-next-line no-console
      console.error('删除项目失败:', error)
      toast.error(error.message || '删除项目失败，请稍后重试')
    } finally {
      setSubmitting(false)
      setDeleting(null)
    }
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

      <Main className={`space-y-4 ${containerEnter}`}>
        <ListToolbar
          q={q}
          onQChange={(x) => {
            setPage(1)
            setQ(x)
          }}
          status={status}
          onStatusChange={(newStatus) => {
            setPage(1)
            setStatus(newStatus)
          }}
          onCreate={() => setCreateOpen(true)}
          onGraph={() => navigate({ to: '/project-graph' })}
          total={total}
        />

        {/* 列表 */}
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className='space-y-3 rounded-xl border p-4'>
                  <Skeleton className='h-5 w-40' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-2/3' />
                </div>
              ))
            : items.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={() => {
                    setEditing(p)
                    setEditOpen(true)
                  }}
                  onDelete={() => {
                    setDeleting(p)
                    setConfirmOpen(true)
                  }}
                  onCreateSubproject={() => {
                    setSubParent(p)
                    setSubCreateOpen(true)
                  }}
                  onLink={() => {
                    setLinkChildId(p.id)
                    setLinkOpen(true)
                  }}
                />
              ))}
        </div>

        {/* 空状态 */}
        {!loading && items.length === 0 && (
          <div className='border border-dashed rounded-lg p-8 text-center text-sm text-muted-foreground'>
            <span>{t('projects.list.emptyPrefix')}</span>
            <Button
              variant='link'
              size='sm'
              className='p-0 h-auto align-baseline'
              onClick={() => setCreateOpen(true)}
            >
              {t('projects.list.emptyCreate')}
            </Button>
          </div>
        )}

        {/* 分页 */}
        {!loading && totalPages > 1 && (
          <div className='flex items-center justify-center gap-3 pt-2'>
            <Button variant='outline' size='sm' disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              {t('projects.pagination.prev')}
            </Button>
            <span className='text-xs text-muted-foreground'>
              {t('projects.pagination.pageXofY', { x: page, y: totalPages })}
            </span>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              {t('projects.pagination.next')}
            </Button>
          </div>
        )}
      </Main>

      {/* 新建 */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('projects.list.create')}</DialogTitle>
          </DialogHeader>
          <ProjectForm mode='create' submitting={submitting} onSubmit={handleCreate} />
        </DialogContent>
      </Dialog>

      {/* 新建子项目 */}
      <Dialog open={subCreateOpen} onOpenChange={(o) => { setSubCreateOpen(o); if (!o) setSubParent(null) }}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('projects.sub.title', { defaultValue: '创建子项目' })}</DialogTitle>
          </DialogHeader>
          {subParent && (
            <SubprojectForm parent={subParent} submitting={submitting} onSubmit={handleCreateSubproject} />
          )}
        </DialogContent>
      </Dialog>

      {/* 编辑 */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditing(null) }}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle>{t('common.edit', { defaultValue: '编辑' })}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            mode='edit'
            submitting={submitting}
            defaultValues={{
              projectName: editing?.name ?? '',
              description: editing?.description ?? '',
              status: editing?.status ?? '1',
            }}
            onSubmit={handleEdit}
          />
        </DialogContent>
      </Dialog>

      {/* 删除二次确认 */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={t('projects.card.delete')}
        desc={`${t('projects.card.delete')}「${deleting?.name ?? ''}」？`}
        destructive
        isLoading={submitting}
        handleConfirm={handleDelete}
        cancelBtnText={t('common.cancel')}
        confirmText={t('projects.card.delete')}
      />

      {/* 创建成功倒计时刷新对话框 */}
      <RefreshCountdownDialog
        open={refreshDialogOpen}
        onOpenChange={setRefreshDialogOpen}
        title="项目创建成功"
        description="项目创建成功！页面将在 {seconds} 秒后自动刷新"
        countdownSeconds={3}
        onRefresh={handleRefreshPage}
      />
      
      <LinkProjectsDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        initialChildId={linkChildId}
        onConfirm={async (parentId, childId) => {
          const now = new Date()
          const due = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
          const child = items.find(p => p.id === childId)
          const projectName = child?.name ?? String(childId)
          const description = `由“关联父子关系”操作发起关联。父项目ID：${parentId}；子项目：${child?.name ?? childId}（ID：${childId}）。`
          try {
            const result = await projectsService.createSubProjectOa({
              projectParentId: parentId,
              projectSubId: childId,
              projectName,
              description,
              projectDescription: '',
              startTime: now,
              dueDate: due,
              priority: '1',
            })
            toast.success(`${t('projects.relation.successPrefix')}${parentId} -> ${childId}，已创建副项目${result.id ? `（ID：${result.id}）` : ''}`)
            setLinkOpen(false)
            projectsCacheManager.clearCache()
          } catch (e: unknown) {
            const err = e as { message?: string }
            toast.error(err.message || '创建副项目失败，请稍后重试')
          }
        }}
      />
    </>
  )
}
