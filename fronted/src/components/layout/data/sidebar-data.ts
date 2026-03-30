import {
  // IconBarrierBlock,
  // IconBrowserCheck,
  // IconBug,
  IconChecklist,
  // IconClipboardList,
  // IconColumns,
  IconTimeline,
  // IconError404,
  IconGitBranch,
  IconLayoutDashboard,
  // IconLock,
  // IconLockAccess,
  // IconMessages,
  // IconNotification,
  // IconPalette,
  // IconServerOff,
  // IconSettings,
  // IconTool,
  // IconUserCog,
  // IconUserOff,
  // IconUsers,
  IconBriefcase,
  IconFileTypography,
  IconChartBar,
} from '@tabler/icons-react'
import { useTranslation } from 'react-i18next'
import { type SidebarData } from '../types'

export const useSidebarData = (): SidebarData => {
  const { t } = useTranslation()

  return {
    user: {
      name: 'satnaing',
      email: 'satnaingdev@gmail.com',
      avatar: '/avatars/shadcn.jpg',
    },
    navGroups: [
      {
        title: t('navigation.general'),
        items: [
          {
            title: t('navigation.dashboard'),
            url: '/dashboard',
            icon: IconLayoutDashboard,
          },
          // {
          //   title: t('navigation.sendNotice'),
          //   url: '/send-notice',
          //   icon: IconNotification,
          // },
          // {
          //   title: t('navigation.chats'),
          //   url: '/chats',
          //   badge: '3',
          //   icon: IconMessages,
          // },
          // {
          //   title: t('navigation.users'),
          //   url: '/users',
          //   icon: IconUsers,
          // },
        ],
      },
      {
        title: t('navigation.tasks'),
        items: [
          {
            title: t('navigation.taskList'),
            url: '/tasks',
            icon: IconChecklist,
          },
          // {
          //   title: t('navigation.taskBoard'),
          //   url: '/kanban',
          //   icon: IconColumns,
          // },
          // {
          //   title: t('navigation.myTasks'),
          //   url: '/my-tasks',
          //   icon: IconClipboardList,
          // },
          {
            title: t('navigation.taskGraph'),
            url: '/task-graph',
            icon: IconGitBranch,
          },
          
          // {
          //   title: t('navigation.gantt'),
          //   url: '/gantt',
          //   icon: IconTimeline,
          // },
          {
            title: t('navigation.ganttNew', { defaultValue: '任务甘特图' }),
            url: '/gantt-new',
            icon: IconTimeline,
          },
        ],
      },
      {
        title: t('navigation.projects'),
        items: [
          {
            title: t('navigation.projectOverview'),
            url: '/project-overview',
            icon: IconChartBar,
          },
          {
            title: t('navigation.projectManagement'),
            url: '/projects',
            icon: IconBriefcase,
          },
          {
            title: t('navigation.projectGraph', { defaultValue: '项目关系图' }),
            url: '/project-graph',
            icon: IconGitBranch,
          },
        ],
      },
      {
        title: t('navigation.documents', { defaultValue: '文档' }),
        items: [
          {
            title: t('navigation.projectDocuments'),
            url: '/documents',
            icon: IconFileTypography,
          },
        ],
      },
      {
        title: t('navigation.projectSettings'),
        items: [
          {
            title: t('navigation.customFields'),
            url: '/templates/management',
            icon: IconFileTypography,
          },
        ],
      },
      // {
      //   title: t('navigation.pages'),
      //   items: [
      //     {
      //       title: t('navigation.auth'),
      //       icon: IconLockAccess,
      //       items: [
      //         {
      //           title: t('navigation.signIn'),
      //           url: '/sign-in',
      //         },
      //         {
      //           title: t('navigation.signUp'),
      //           url: '/sign-up',
      //         },
      //         {
      //           title: t('navigation.forgotPassword'),
      //           url: '/forgot-password',
      //         },
      //         {
      //           title: t('navigation.otp'),
      //           url: '/otp',
      //         },
      //       ],
      //     },
      //     {
      //       title: t('navigation.errors'),
      //       icon: IconBug,
      //       items: [
      //         {
      //           title: t('navigation.unauthorized'),
      //           url: '/401',
      //           icon: IconLock,
      //         },
      //         {
      //           title: t('navigation.forbidden'),
      //           url: '/403',
      //           icon: IconUserOff,
      //         },
      //         {
      //           title: t('navigation.notFound'),
      //           url: '/404',
      //           icon: IconError404,
      //         },
      //         {
      //           title: t('navigation.internalServerError'),
      //           url: '/500',
      //           icon: IconServerOff,
      //         },
      //         {
      //           title: t('navigation.maintenanceError'),
      //           url: '/503',
      //           icon: IconBarrierBlock,
      //         },
      //       ],
      //     },
      //   ],
      // },
      // {
      //   title: t('navigation.other'),
      //   items: [
      //     {
      //       title: t('navigation.settings'),
      //       icon: IconSettings,
      //       items: [
      //         {
      //           title: t('navigation.profile'),
      //           url: '/settings',
      //           icon: IconUserCog,
      //         },
      //         {
      //           title: t('navigation.account'),
      //           url: '/settings/account',
      //           icon: IconTool,
      //         },
      //         {
      //           title: t('navigation.appearance'),
      //           url: '/settings/appearance',
      //           icon: IconPalette,
      //         },
      //         {
      //           title: t('navigation.notifications'),
      //           url: '/settings/notifications',
      //           icon: IconNotification,
      //         },
      //         {
      //           title: t('navigation.display'),
      //           url: '/settings/display',
      //           icon: IconBrowserCheck,
      //         },
      //       ],
      //     },
      //   ],
      // },
    ],
  }
}
