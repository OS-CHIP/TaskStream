import { GanttItem } from '../hooks/useGantt'

export const mockGanttData: GanttItem[] = [
  {
    id: '1',
    name: '项目规划阶段',
    startTS: new Date('2024-01-01').getTime(),
    duration: 14 * 24 * 60 * 60 * 1000, // 14天
    status: '2', // 进行中
    assignee: 1,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: '需求分析',
    startTS: new Date('2024-01-10').getTime(),
    duration: 10 * 24 * 60 * 60 * 1000, // 10天
    status: '3', // 已完成
    assignee: 2,
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: '系统设计',
    startTS: new Date('2024-01-20').getTime(),
    duration: 15 * 24 * 60 * 60 * 1000, // 15天
    status: '2', // 进行中
    assignee: 3,
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-04'),
  },
  {
    id: '4',
    name: '前端开发',
    startTS: new Date('2024-02-01').getTime(),
    duration: 20 * 24 * 60 * 60 * 1000, // 20天
    status: '1', // 待开始
    assignee: 4,
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-02-21'),
  },
  {
    id: '5',
    name: '后端开发',
    startTS: new Date('2024-02-05').getTime(),
    duration: 18 * 24 * 60 * 60 * 1000, // 18天
    status: '1', // 待开始
    assignee: 5,
    startDate: new Date('2024-02-05'),
    endDate: new Date('2024-02-23'),
  },
  {
    id: '6',
    name: '数据库设计',
    startTS: new Date('2024-01-25').getTime(),
    duration: 8 * 24 * 60 * 60 * 1000, // 8天
    status: '3', // 已完成
    assignee: 6,
    startDate: new Date('2024-01-25'),
    endDate: new Date('2024-02-02'),
  },
  {
    id: '7',
    name: 'API接口开发',
    startTS: new Date('2024-02-10').getTime(),
    duration: 12 * 24 * 60 * 60 * 1000, // 12天
    status: '5', // 已阻塞
    assignee: 7,
    startDate: new Date('2024-02-10'),
    endDate: new Date('2024-02-22'),
  },
  {
    id: '8',
    name: '单元测试',
    startTS: new Date('2024-02-20').getTime(),
    duration: 7 * 24 * 60 * 60 * 1000, // 7天
    status: '1', // 待开始
    assignee: 8,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-27'),
  },
  {
    id: '9',
    name: '集成测试',
    startTS: new Date('2024-02-25').getTime(),
    duration: 10 * 24 * 60 * 60 * 1000, // 10天
    status: '1', // 待开始
    assignee: 9,
    startDate: new Date('2024-02-25'),
    endDate: new Date('2024-03-06'),
  },
  {
    id: '10',
    name: '部署上线',
    startTS: new Date('2024-03-05').getTime(),
    duration: 5 * 24 * 60 * 60 * 1000, // 5天
    status: '4', // 已取消
    assignee: 10,
    startDate: new Date('2024-03-05'),
    endDate: new Date('2024-03-10'),
  },
]

export const mockMembers = [
  { label: '张三', value: 1 },
  { label: '李四', value: 2 },
  { label: '王五', value: 3 },
  { label: '赵六', value: 4 },
  { label: '钱七', value: 5 },
  { label: '孙八', value: 6 },
  { label: '周九', value: 7 },
  { label: '吴十', value: 8 },
  { label: '郑十一', value: 9 },
  { label: '王十二', value: 10 },
]