import { TemplateType } from '@/types/templates'
import { TaskStatus, TaskStatusType } from '@/features/tasks/data/schema'

// Unified entity type across templates/instances/tasks
export type EntityType = TemplateType

// Canonical workflow status identifiers used across the app
export const WorkflowStatus = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  TESTING: 'testing',
  COMPLETED: 'completed',
  BLOCKED: 'blocked',
  ON_HOLD: 'on-hold',
  ACCEPTED: 'accepted',
  CLOSED: 'closed',
  REOPENED: 'reopened',
  REJECTED: 'rejected',
} as const

export type WorkflowStatusId = typeof WorkflowStatus[keyof typeof WorkflowStatus]

// Map task module statuses to unified workflow statuses
export function mapTaskStatusToWorkflow(status: TaskStatusType): WorkflowStatusId {
  switch (status) {
    case TaskStatus.TODO:
      return WorkflowStatus.PENDING
    case TaskStatus.IN_PROGRESS:
      return WorkflowStatus.IN_PROGRESS
    case TaskStatus.DONE:
      return WorkflowStatus.COMPLETED
    case TaskStatus.CANCELED:
      return WorkflowStatus.CLOSED
    case TaskStatus.BLOCKED:
      return WorkflowStatus.BLOCKED
    default:
      return WorkflowStatus.PENDING
  }
}

// Optional reverse mapping if needed by tasks module
export function mapWorkflowToTaskStatus(status: WorkflowStatusId): TaskStatusType {
  switch (status) {
    case WorkflowStatus.PENDING:
      return TaskStatus.TODO
    case WorkflowStatus.IN_PROGRESS:
      return TaskStatus.IN_PROGRESS
    case WorkflowStatus.COMPLETED:
      return TaskStatus.DONE
    case WorkflowStatus.CLOSED:
      return TaskStatus.CANCELED
    case WorkflowStatus.BLOCKED:
      return TaskStatus.BLOCKED
    default:
      return TaskStatus.TODO
  }
}


