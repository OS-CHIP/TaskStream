export type MessageCategory = "announcement" | "reminder" | "warning" | "info"

export interface Message {
  id: string
  title: string
  content: string
  category: MessageCategory
  tags?: string[]
  createdAt: string
  read: boolean
  severity?: "info" | "urgent"
  type?: 1 | 2
}

export const MOCK_MESSAGES: Message[] = [
  {
    id: "m-001",
    title: "系统维护通知",
    content:
      "系统将于今晚 22:00–24:00 进行重要维护升级，期间可能影响部分功能使用，请提前保存工作内容。维护完成后系统性能将得到显著提升。",
    category: "announcement",
    tags: ["更新", "系统"],
    createdAt: "2024-01-15T14:30:00Z",
    read: false,
    severity: "info",
  },
  {
    id: "m-002",
    title: "任务状态更新",
    content:
      "张三已完成任务“用户界面设计优化”，项目“消息中心 UI 优化”进度更新为 75%。",
    category: "info",
    tags: ["项目通知"],
    createdAt: "2024-01-15T11:45:00Z",
    read: true,
  },
  {
    id: "m-003",
    title: "新功能上线通知",
    content:
      "消息中心新增了智能消息分类功能，现在可以更精准地管理不同类型的通知消息。",
    category: "announcement",
    tags: ["优先体验"],
    createdAt: "2024-01-15T09:30:00Z",
    read: true,
  },
  {
    id: "m-004",
    title: "截止日期提醒",
    content:
      "项目“移动端布局优化”的用研录入 UI 设计完成，评审将于明天 10:00 开始，请及时处理。",
    category: "reminder",
    tags: ["提醒"],
    createdAt: "2024-01-14T16:20:00Z",
    read: false,
  },
  {
    id: "m-005",
    title: "存储空间不足警告",
    content:
      "您的文件存储空间使用率已达到 85%，建议及时清理不必要的文件或升级存储套餐。",
    category: "warning",
    tags: ["系统"],
    createdAt: "2024-01-14T10:15:00Z",
    read: false,
    severity: "urgent",
  },
  {
    id: "m-006",
    title: "系统版本更新 v2.1.0",
    content:
      "本次更新新增了消息分类、批量操作、优化了通知推送机制，并修复了若干已知问题。",
    category: "announcement",
    tags: ["系统更新"],
    createdAt: "2024-01-13T14:00:00Z",
    read: true,
  },
  {
    id: "m-007",
    title: "安全提醒",
    content:
      "检测到来自非常用设备的登录尝试，如果不是您本人操作，请及时修改密码并关注账号安全。",
    category: "warning",
    tags: ["安全"],
    createdAt: "2024-01-13T08:30:00Z",
    read: false,
    severity: "urgent",
  },
]
