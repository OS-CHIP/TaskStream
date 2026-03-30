import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavGroup } from '@/components/layout/nav-group'
import { NavUser } from '@/components/layout/nav-user'
import { useSidebarData } from './data/sidebar-data'
import { ProjectSwitcher } from '@/components/layout/project-switcher'
import { useTranslation } from 'react-i18next'
import type { Project } from '@/components/layout/project-switcher/types'
import { useProjectsQuery } from '@/components/layout/project-switcher/use-projects-query'
import { useAuthStore } from '@/stores/authStore'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarData = useSidebarData()
  const { t } = useTranslation()
  const { projects, isLoading } = useProjectsQuery()
  const isProjectsEmpty = !isLoading && projects.length === 0
  const isOwner = useAuthStore((s) => s.auth.isProjectOwner)
  
  // 项目切换处理函数
  const handleProjectChange = (_project: Project) => {
    // 项目切换逻辑
    // 这里可以添加项目切换的业务逻辑
    // 例如：更新全局状态、发送分析事件等
  }
  
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarContent>
        {!isProjectsEmpty && (
          <div className="p-2">
            <ProjectSwitcher
              onProjectChange={handleProjectChange}
              searchPlaceholder={t('projectSwitcher.searchPlaceholder')}
              emptyMessage={t('projectSwitcher.noProjects')}
              noResultsMessage={t('projectSwitcher.noResults')}
              variant="responsive"
            />
          </div>
        )}
        {(() => {
          const baseGroups = isProjectsEmpty
            ? sidebarData.navGroups
                .map((group) => ({
                  ...group,
                  items: group.items.filter((item): item is typeof group.items[number] & { url: string } => {
                    const allowed = new Set(['/projects', '/project-graph'])
                    return 'url' in item && typeof item.url === 'string' && allowed.has(item.url)
                  }),
                }))
                .filter((group) => group.items.length > 0)
            : sidebarData.navGroups

          const visibleGroups = isOwner
            ? baseGroups
            : baseGroups
                .map((group) => {
                  const isProjectSettings = group.title === t('navigation.projectSettings')
                  const isProjectsGroup = group.title === t('navigation.projects')
                  if (isProjectSettings) return null
                  if (isProjectsGroup) {
                    const allowed = new Set(['/projects', '/project-graph'])
                    const visibleItems = group.items.filter(
                      (item): item is typeof group.items[number] & { url: string } =>
                        'url' in item && typeof item.url === 'string' && allowed.has(item.url)
                    )
                    return { ...group, items: visibleItems }
                  }
                  return group
                })
                .filter((group): group is typeof baseGroups[number] => !!group && group.items.length > 0)

          return visibleGroups
        })().map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
        <div className="w-full text-center text-xs opacity-60 select-none">
          v1.0.0
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
