import { Status } from '@/types/status'
import { WorkflowStatus } from '@/types/workflow'

// 定义默认状态 - 改为键值对形式
export const defaultStatuses: Record<string, Status> = {
  [WorkflowStatus.DRAFT]: {
    id: WorkflowStatus.DRAFT,
    name: '草稿',
    description: '项目已创建但尚未提交',
    color: '#9CA3AF',
    order: 0,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.PENDING]: {
    id: WorkflowStatus.PENDING,
    name: '待处理',
    description: '项目已创建但尚未开始处理',
    color: '#6B7280',
    order: 1,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.IN_PROGRESS]: {
    id: WorkflowStatus.IN_PROGRESS,
    name: '进行中',
    description: '项目正在 actively 进行中',
    color: '#3B82F6',
    order: 2,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.COMPLETED]: {
    id: WorkflowStatus.COMPLETED,
    name: '已完成',
    description: '项目已完成',
    color: '#10B981',
    order: 3,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.BLOCKED]: {
    id: WorkflowStatus.BLOCKED,
    name: '已阻塞',
    description: '项目因某些原因受阻',
    color: '#EF4444',
    order: 4,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.ON_HOLD]: {
    id: WorkflowStatus.ON_HOLD,
    name: '挂起',
    description: '项目暂时搁置',
    color: '#F59E0B',
    order: 5,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.TESTING]: {
    id: WorkflowStatus.TESTING,
    name: '待审核',
    description: '进入测试/验收阶段',
    color: '#22c55e',
    order: 6,
    isDefault: true,
    applicableTypes: ['requirement', 'task', 'bug', 'test'],
  },

  [WorkflowStatus.ACCEPTED]: {
    id: WorkflowStatus.ACCEPTED,
    name: '已验收',
    description: '项目已完成并通过验收',
    color: '#8B5CF6',
    order: 7,
    isDefault: true,
    applicableTypes: ['requirement', 'test'],
  },

  [WorkflowStatus.CLOSED]: {
    id: WorkflowStatus.CLOSED,
    name: '已关闭',
    description: '项目已关闭',
    color: '#1F2937',
    order: 8,
    isDefault: true,
    applicableTypes: ['bug', 'task'],
  },

  [WorkflowStatus.REOPENED]: {
    id: WorkflowStatus.REOPENED,
    name: '重新打开',
    description: '项目被重新打开',
    color: '#EC4899',
    order: 9,
    isDefault: true,
    applicableTypes: ['bug', 'requirement', 'task'],
  },

  [WorkflowStatus.REJECTED]: {
    id: WorkflowStatus.REJECTED,
    name: '已拒绝',
    description: '项目被拒绝',
    color: '#6B7280',
    order: 10,
    isDefault: true,
    applicableTypes: ['requirement'],
  },
}
