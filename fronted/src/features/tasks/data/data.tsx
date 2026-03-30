import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUp,
  IconCircle,
  IconCircleCheck,
  IconCircleX,
  IconAlertTriangle,
  IconStopwatch,
  IconEye,
} from '@tabler/icons-react'
import i18n from '@/lib/i18n'
import { TaskLabel, TaskStatus, TaskPriority } from './schema'

export const labels = [
  {
    value: TaskLabel.BUG,
    label: i18n.t('tasks.labels.bug'),
  },
  {
    value: TaskLabel.DESIGN_TASK,
    label: 'Design Task',
  },
  {
    value: TaskLabel.TEST_TASK,
    label: 'Test Task',
  },
  {
    value: TaskLabel.DEFAULT,
    label: 'Default',
  },
  {
    value: TaskLabel.OTHER,
    label: 'Other',
  },
]

export const statuses = [
  {
    value: TaskStatus.TODO,
    label: i18n.t('tasks.status.todo'),
    icon: IconCircle,
  },
  {
    value: TaskStatus.IN_PROGRESS,
    label: i18n.t('tasks.status.inProgress'),
    icon: IconStopwatch,
  },
  {
    value: TaskStatus.DONE,
    label: i18n.t('tasks.status.done'),
    icon: IconCircleCheck,
  },
  {
    value: TaskStatus.CANCELED,
    label: i18n.t('tasks.status.canceled'),
    icon: IconCircleX,
  },
  {
    value: TaskStatus.BLOCKED,
    label: i18n.t('tasks.status.blocked'),
    icon: IconAlertTriangle,
  },
  {
    value: TaskStatus.PENDING_REVIEW,
    label: i18n.t('tasks.status.pendingReview') || '待review',
    icon: IconEye,
  },
]

export const priorities = [
  {
    label: i18n.t('tasks.priority.low'),
    value: TaskPriority.LOW,
    icon: IconArrowDown,
  },
  {
    label: i18n.t('tasks.priority.medium'),
    value: TaskPriority.MEDIUM,
    icon: IconArrowRight,
  },
  {
    label: i18n.t('tasks.priority.high'),
    value: TaskPriority.HIGH,
    icon: IconArrowUp,
  },
]
