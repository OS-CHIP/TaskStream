import type { Instance } from '@/types/instance'

export type TaskLike = {
  id: string
  title?: string
  assignee?: string
  dueDate?: Date | string
  priority?: 'low' | 'medium' | 'high' | 'urgent' | string
  label?: string
  estimatedHours?: number
  fields?: Array<{ fieldId: string; value: unknown }>
}

const WELL_KNOWN_FIELD_IDS = {
  title: 'title',
  assignee: 'assignee',
  dueDate: 'dueDate',
  priority: 'priority',
  label: 'label',
  estimatedHours: 'estimatedHours',
}

export function isTemplateInstance(value: unknown): value is Instance {
  return !!value && typeof value === 'object' && Array.isArray((value as Instance).fields)
}

function getFieldValue<T>(instance: Instance | TaskLike, fieldId: string): T | undefined {
  const list = (instance as Instance).fields as Array<{ fieldId: string; value: T }> | undefined
  if (!Array.isArray(list)) return undefined
  const found = list.find(f => f.fieldId === fieldId)
  return found?.value as T | undefined
}

export function getTitle(taskOrInstance: TaskLike | Instance): string | undefined {
  return isTemplateInstance(taskOrInstance)
    ? (getFieldValue<string>(taskOrInstance, WELL_KNOWN_FIELD_IDS.title) ?? undefined)
    : (taskOrInstance as TaskLike).title
}

export function getAssignee(taskOrInstance: TaskLike | Instance): string | undefined {
  return isTemplateInstance(taskOrInstance)
    ? (getFieldValue<string>(taskOrInstance, WELL_KNOWN_FIELD_IDS.assignee) ?? undefined)
    : (taskOrInstance as TaskLike).assignee
}

export function getDueDate(taskOrInstance: TaskLike | Instance): Date | string | undefined {
  return isTemplateInstance(taskOrInstance)
    ? (getFieldValue<Date | string>(taskOrInstance, WELL_KNOWN_FIELD_IDS.dueDate) ?? undefined)
    : (taskOrInstance as TaskLike).dueDate
}

export function getPriority(taskOrInstance: TaskLike | Instance): string | undefined {
  return isTemplateInstance(taskOrInstance)
    ? (getFieldValue<string>(taskOrInstance, WELL_KNOWN_FIELD_IDS.priority) ?? undefined)
    : (taskOrInstance as TaskLike).priority
}

export function getLabel(taskOrInstance: TaskLike | Instance): string | undefined {
  return isTemplateInstance(taskOrInstance)
    ? (getFieldValue<string>(taskOrInstance, WELL_KNOWN_FIELD_IDS.label) ?? undefined)
    : (taskOrInstance as TaskLike).label
}

export function getEstimatedHours(taskOrInstance: TaskLike | Instance): number | undefined {
  return isTemplateInstance(taskOrInstance)
    ? (getFieldValue<number>(taskOrInstance, WELL_KNOWN_FIELD_IDS.estimatedHours) ?? undefined)
    : (taskOrInstance as TaskLike).estimatedHours
}


