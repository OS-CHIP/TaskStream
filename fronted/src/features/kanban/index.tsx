import { KanbanBoard } from './components/kanban-board'

/**
 * 看板功能主入口组件
 * 导出看板页面的主要组件
 */
export function Kanban() {
  return <KanbanBoard />
}

// 导出其他组件供外部使用
export { KanbanBoard } from './components/kanban-board'
export { KanbanCard } from './components/kanban-card'
export { KanbanColumn } from './components/kanban-column'
export { KanbanFilters } from './components/kanban-filters'
export { useKanban, useDragAndDrop } from './hooks/use-kanban'