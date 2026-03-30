import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { LanguageSwitch } from '@/components/language-switch'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/components/notification-bell'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useParams } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VisibilityBadge } from './components/visibility-badge'
import { MemberList } from './components/member-list'
import { InviteDialog } from './components/invite-dialog'
import type { Project, ProjectMember, Visibility, Role } from './types'
import { projectsService } from './services/projects.service'
import { toast } from 'sonner'
import NotFoundError from '@/features/errors/not-found-error'
import { useTranslation } from 'react-i18next'
import { tabContent, containerEnter } from './utils/animations'
// 注册本模块 i18n 资源
import '@/features/projects/i18n/register'
import { SettingsForm, type SettingsFormValues } from './components/settings-form'

export default function ProjectDetail() {
  const { projectId } = useParams({ from: '/_authenticated/projects/$projectId' }) as { projectId: string }
  const { t } = useTranslation()

  const [project, setProject] = useState<Project | null>(null)
  const [members, setMembers] = useState<ProjectMember[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'members' | 'settings'>('overview')

  const [inviteOpen, setInviteOpen] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)

  // 加载项目详情和成员数据
  useEffect(() => {
    const abortController = new AbortController()
    const signal = abortController.signal
    
    setLoading(true)
    setNotFound(false)
    
    Promise.all([
      projectsService.getById(projectId, signal),
      projectsService.listMembers(projectId, signal)
    ])
      .then(([p, ms]) => {
        if (signal.aborted) return
        setProject(p)
        setMembers(ms)
      })
      .catch((e) => {
        if (signal.aborted) return
        const error = e as { code?: string; name?: string }
        if (error?.name === 'AbortError' || error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
          return // 请求被取消，不需要处理
        }
        if (error?.code === 'NOT_FOUND') {
          setNotFound(true)
        } else {
          toast.error(t('projects.toast.loadFailed', { defaultValue: '加载失败' }) || '加载失败', { id: 'projects-load-failed' })
        }
      })
      .finally(() => {
        if (!signal.aborted) {
          setLoading(false)
        }
      })
    
    return () => {
      abortController.abort()
    }
  }, [projectId, t])

  if (notFound) {
    return <NotFoundError />
  }

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className={`space-y-4 ${containerEnter}`}>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              {loading ? t('common.loading') : project?.name ?? '—'}
            </h2>
            <p className='text-muted-foreground'>
              {loading
                ? ''
                : <>
                    {t('projects.detail.labels.id')}：{project?.id} · {t('projects.detail.labels.key')}：{project?.key}
                  </>}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {!loading && project ? <VisibilityBadge value={project.visibility as Visibility} /> : <Badge>—</Badge>}
            <Button variant='outline' onClick={() => setInviteOpen(true)}>
              {t('projects.detail.inviteButton')}
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'overview' | 'members' | 'settings')} className='space-y-4'>
          <TabsList className='w-full sm:w-auto'>
            <TabsTrigger value='overview'>{t('projects.detail.overview')}</TabsTrigger>
            <TabsTrigger value='members'>{t('projects.detail.members')}</TabsTrigger>
            <TabsTrigger value='settings'>{t('projects.detail.settings')}</TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className={tabContent}>
            <Card>
              <CardHeader>
                <CardTitle>{t('projects.detail.overviewTitle')}</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2 text-sm text-muted-foreground'>
                {loading ? (
                  <div className='h-16 rounded bg-muted animate-pulse' />
                ) : (
                  <>
                    <div>{t('projects.detail.labels.desc')}：{project?.description || '—'}</div>
                    <div>
                      {t('projects.detail.labels.visibility')}：
                      {project ? <VisibilityBadge value={project.visibility as Visibility} /> : '—'}
                    </div>
                    <div>{t('projects.detail.labels.createdAt')}：{project?.createdAt}</div>
                    <div>{t('projects.detail.labels.updatedAt')}：{project?.updatedAt}</div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>



          <TabsContent value='members' className={tabContent}>
            <Card>
              <CardHeader>
                <CardTitle>{t('projects.detail.members')}</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberList
                  loading={loading}
                  members={members}
                  onChangeRole={async (memberId: string, role: Role) => {
                    try {
                      // 模拟API调用延迟
                      await new Promise(resolve => setTimeout(resolve, 1000))
                      setMembers((prev) => prev.map((m) => (m.id === memberId ? { ...m, role } : m)))
                      toast.success(t('projects.toast.updateRoleSuccess'))
                    } catch {
                      toast.error(t('projects.toast.updateRoleFailed'))
                    }
                  }}
                  onRemove={async (memberId: string) => {
                    if (!project) return
                    try {
                      // 根据memberId找到对应的成员对象，获取其userId
                      const member = members.find(m => m.id === memberId);
                      if (!member) {
                        toast.error('未找到要移除的成员');
                        return;
                      }
                      
                      await projectsService.removeProjectUser({
                        projectId: project.id,
                        userId: member.userId,
                      })
                      setMembers((prev) => prev.filter((m) => m.id !== memberId))
                      toast.success(t('projects.toast.removeSuccess'))
                    } catch (_error) {
                      // console.error('Failed to remove user:', error)
                      toast.error(t('projects.toast.removeFailed'))
                    }
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='settings' className={tabContent}>
            <Card>
              <CardHeader>
                <CardTitle>{t('projects.detail.settings')}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading || !project ? (
                  <div className='h-16 rounded bg-muted animate-pulse' />
                ) : (
                  <SettingsForm
                    defaultValues={{
                      name: project.name,
                      description: project.description ?? '',
                      visibility: project.visibility as Visibility,
                    }}
                    submitting={savingSettings}
                    onSubmit={async (values: SettingsFormValues) => {
                      setSavingSettings(true)
                      try {
                        const updated = await projectsService.update(project.id, {
                          name: values.name,
                          description: values.description,
                          // visibility: values.visibility as Visibility, // API 不支持此字段
                        })
                        setProject(updated)
                        toast.success(t('projects.toast.saveSuccess'))
                      } catch {
                        toast.error(t('projects.toast.saveFailed'))
                      } finally {
                        setSavingSettings(false)
                      }
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Main>

      <InviteDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        projectId={project?.id || null}
        onInviteSuccess={async () => {
          if (!project) return
          try {
            // 重新加载成员列表
            const updatedMembers = await projectsService.listMembers(project.id)
            setMembers(updatedMembers)
            setInviteOpen(false)
          } catch (_error) {
            // console.error('Failed to reload members:', error)
            toast.error(t('projects.toast.loadFailed', { defaultValue: '加载失败' }) || '加载失败')
          }
        }}
      />
    </>
  )
}
