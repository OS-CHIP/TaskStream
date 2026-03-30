import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search as SearchComponent } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { LanguageSwitch } from '@/components/language-switch'
import { NotificationBell } from '@/components/notification-bell'
import { Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { projectRelationsService } from '@/features/projects/services/project-relations.service'
import { TaskService } from '@/features/tasks/services/task-service'

type ProjectStatus = 'visible' | 'hidden' | 'unknown'

interface ProjectItem {
  id: string
  name: string
  description?: string
  status: ProjectStatus
  parentIds: string[]
  childIds: string[]
  createdAt?: Date
  updatedAt?: Date
  ownerId?: string
  ownerName?: string
}

interface NodePosition {
  x: number
  y: number
}

interface ProjectNode extends ProjectItem {
  level: number
  children: ProjectNode[]
  parent?: ProjectNode
  position: NodePosition
}

const statusColor = {
  visible: { color: 'rgb(59,130,246)', bg: 'rgb(219,234,254)' },
  hidden: { color: 'rgb(107,114,128)', bg: 'rgb(243,244,246)' },
  unknown: { color: 'rgb(148,163,184)', bg: 'rgb(241,245,249)' },
}

interface Relation {
  parentProjectId: number | string
  childProjectId: number | string
  isDeleted?: string | number
}

const buildProjectRelationships = (projects: ProjectItem[], relations: Relation[]): ProjectItem[] => {
  const map = new Map<string, ProjectItem>()
  projects.forEach(pr => map.set(pr.id, { ...pr, parentIds: [], childIds: [] }))
  relations.forEach(rel => {
    const notDeleted = String(rel.isDeleted ?? '0') === '0'
    if (!notDeleted) return
    const parentId = String(rel.parentProjectId)
    const childId = String(rel.childProjectId)
    const parent = map.get(parentId)
    const child = map.get(childId)
    if (parent && child) {
      if (!parent.childIds.includes(childId)) parent.childIds.push(childId)
      if (!child.parentIds.includes(parentId)) child.parentIds.push(parentId)
    }
  })
  return Array.from(map.values())
}

export function ProjectRelationshipGraph() {
  const { t } = useTranslation()
  const [relationshipProjects, setRelationshipProjects] = useState<ProjectItem[]>([])
  const [rightSelectedId, setRightSelectedId] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userMap, setUserMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const tree = await projectRelationsService.queryProjectTree()
        const { items, relations } = normalizeProjectTree(tree)
        const withRel = buildProjectRelationships(items, relations)
        setRelationshipProjects(withRel)
        const roots = withRel.filter(p => p.parentIds.length === 0)
        if (roots.length > 0) {
          setRightSelectedId(roots[0].id)
        }
      } catch (e) {
        const err = e as { message?: string }
        setError(err.message || '获取项目关系数据失败')
        setRelationshipProjects([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    const projectId = localStorage.getItem('selected_project_id')
    if (!projectId) return
    ;(async () => {
      try {
        const list = await TaskService.getProjectUsers(projectId)
        const map: Record<string, string> = {}
        list.forEach(u => { map[String(u.value)] = u.label })
        setUserMap(map)
      } catch {
        setUserMap({})
      }
    })()
  }, [])

  const resolveUserName = (val: any): string | undefined => {
    if (val === null || val === undefined) return undefined
    const key = String(val)
    const nm = userMap[key]
    if (nm) return String(nm).trim() || key
    for (const k in userMap) {
      // eslint-disable-next-line eqeqeq
      if (val == k) {
        const n = userMap[k]
        return String(n).trim() || String(k)
      }
    }
    return key
  }

  const relationshipMap = useMemo(() => {
    const m = new Map<string, ProjectItem>()
    relationshipProjects.forEach(p => m.set(p.id, p))
    return m
  }, [relationshipProjects])

  const buildTree = (id: string, level = 0, visited = new Set<string>()): ProjectNode | null => {
    if (visited.has(id)) return null
    const p = relationshipMap.get(id)
    if (!p) return null
    visited.add(id)
    const children = p.childIds.map(cid => buildTree(cid, level + 1, visited)).filter(Boolean) as ProjectNode[]
    const node: ProjectNode = { ...p, level, children, position: { x: 0, y: 0 } }
    children.forEach(c => (c.parent = node))
    return node
  }

  const calculatePositions = (root: ProjectNode): ProjectNode => {
    const levelHeight = 150
    const siblingSpacing = 250
    const levelCounts = new Map<number, number>()
    const count = (n: ProjectNode) => {
      levelCounts.set(n.level, (levelCounts.get(n.level) || 0) + 1)
      n.children.forEach(count)
    }
    count(root)
    const levelIndices = new Map<number, number>()
    const assign = (n: ProjectNode) => {
      const idx = levelIndices.get(n.level) || 0
      const cnt = levelCounts.get(n.level) || 1
      const totalWidth = (cnt - 1) * siblingSpacing
      const startX = -totalWidth / 2
      n.position.x = startX + idx * siblingSpacing
      n.position.y = n.level * levelHeight
      levelIndices.set(n.level, idx + 1)
      n.children.forEach(assign)
    }
    assign(root)
    return root
  }

  const collectAll = (n: ProjectNode): ProjectNode[] => {
    const arr = [n]
    n.children.forEach(c => arr.push(...collectAll(c)))
    return arr
  }

  function normalizeProjectTree(tree: any): { items: ProjectItem[]; relations: Relation[] } {
    const items: ProjectItem[] = []
    const relations: Relation[] = []
    const traverse = (node: any, parentId?: string) => {
      if (!node) return
      const id = String(node.id ?? node.projectId ?? node.projectID ?? node.key ?? Math.random().toString(36).slice(2))
      const name = String(node.projectName ?? node.name ?? node.title ?? id)
      const statusRaw = String(node.status ?? '').trim()
      const status: ProjectStatus = statusRaw === '1' ? 'visible' : statusRaw === '2' || statusRaw === '0' ? 'hidden' : 'unknown'
      const ownerId = node.owner != null ? String(node.owner) : (node.ownerId != null ? String(node.ownerId) : undefined)
      const ownerName = node.ownerName != null ? String(node.ownerName) : undefined
      items.push({
        id,
        name,
        description: node.description ?? node.desc ?? undefined,
        status,
        parentIds: [],
        childIds: [],
        createdAt: node.createTime ? new Date(node.createTime) : undefined,
        updatedAt: node.updateTime ? new Date(node.updateTime) : undefined,
        ownerId,
        ownerName,
      })
      if (parentId) {
        relations.push({ parentProjectId: parentId, childProjectId: id, isDeleted: '0' })
      }
      const children = node.children ?? node.childList ?? node.childrens ?? []
      if (Array.isArray(children)) {
        children.forEach((c: any) => traverse(c, id))
      }
    }
    const roots = Array.isArray(tree) ? tree : [tree]
    roots.forEach((node) => traverse(node))
    return { items, relations }
  }

  const getRoots = (): ProjectItem[] => {
    return Array.from(relationshipMap.values()).filter(p => p.parentIds.length === 0)
  }

  const offsetPositions = (n: ProjectNode, ox: number, oy: number) => {
    n.position.x += ox
    n.position.y += oy
    n.children.forEach(c => offsetPositions(c, ox, oy))
  }

  const getTreeWidth = (root: ProjectNode): number => {
    const nodes = collectAll(root)
    const xs = nodes.map(n => n.position.x)
    return Math.max(...xs) - Math.min(...xs) + 140
  }

  const allNodes = useMemo(() => {
    if (relationshipProjects.length === 0) return []
    const out: ProjectNode[] = []
    const processed = new Set<string>()
    const visited = new Set<string>()
    let xOffset = 0
    getRoots().forEach(root => {
      if (!processed.has(root.id)) {
        const r = buildTree(root.id, 0, visited)
        if (r) {
          const pos = calculatePositions(r)
          offsetPositions(pos, xOffset, 0)
          const nodes = collectAll(pos)
          out.push(...nodes)
          nodes.forEach(n => processed.add(n.id))
          const width = getTreeWidth(pos)
          xOffset += width + 300
        }
      }
    })
    const remaining = Array.from(relationshipMap.values()).filter(p => !processed.has(p.id))
    remaining.forEach((p, idx) => {
      out.push({
        ...p,
        level: 0,
        children: [],
        position: { x: xOffset + idx * 200, y: 0 },
      })
    })
    return out
  }, [relationshipProjects])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp = () => setIsDragging(false)

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const renderConnections = () => {
    const connections: React.ReactElement[] = []
    const drawn = new Set<string>()
    allNodes.forEach(node => {
      node.parentIds.forEach(pid => {
        const parent = allNodes.find(n => n.id === pid)
        if (!parent) return
        const key = `${pid}-${node.id}`
        if (drawn.has(key)) return
        drawn.add(key)
        const startX = parent.position.x
        const startY = parent.position.y + 25
        const endX = node.position.x
        const endY = node.position.y - 25
        const color = 'rgb(148,163,184)'
        const midY = (startY + endY) / 2
        const path = `M ${startX} ${startY} C ${startX} ${midY} ${endX} ${midY} ${endX} ${endY}`
        connections.push(
          <path key={key} d={path} stroke={color} strokeWidth="2" fill="none" opacity="0.7" />
        )
      })
    })
    return connections
  }

  const renderNode = (node: ProjectNode) => {
    const cfg = statusColor[node.status]
    const isSelected = node.id === rightSelectedId
    const ownerLabel = t('projectGraph.labels.owner') || '负责人'
    const ownerDisplay = node.ownerName
      ? String(node.ownerName)
      : node.ownerId
        ? resolveUserName(node.ownerId)
        : undefined
    return (
      <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
        <rect
          x="-70"
          y="-25"
          width="140"
          height="50"
          rx="8"
          fill={cfg.bg}
          stroke={cfg.color}
          strokeWidth={isSelected ? 3 : 2}
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => setRightSelectedId(node.id)}
        />
        <text
          x="0"
          y="-2"
          textAnchor="middle"
          className="font-medium"
          style={{ fontSize: '13px', fill: 'rgb(55,65,81)' }}
        >
          {node.name.length > 16 ? `${node.name.substring(0, 16)}...` : node.name}
        </text>
        <text
          x="0"
          y="14"
          textAnchor="middle"
          style={{ fontSize: '11px', fill: 'rgb(107,114,128)' }}
        >
          {`${ownerLabel}: ${ownerDisplay ?? (node.ownerId ?? '')}`}
        </text>
      </g>
    )
  }

  const topNav = [
    {
      title: t('navigation.projectGraph') || '项目关系图',
      href: '/project-graph',
      isActive: true,
      disabled: false,
    },
  ]

  return (
    <>
      <Header>
        <TopNav links={topNav} />
        <div className="ml-auto flex items-center space-x-4">
          <SearchComponent />
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="flex flex-col overflow-hidden h-[calc(100vh-4rem)]">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between flex-shrink-0 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">{t('projectGraph.title') || '项目关系图'}</h1>
              <p className="text-sm text-muted-foreground">{t('projectGraph.subtitle') || '展示父子项目结构关系'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t('projectGraph.toolbar.searchPlaceholder') || '搜索项目名称/描述'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 w-full sm:w-48 text-sm"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ProjectStatus | 'all')}>
                <SelectTrigger size="sm" className="w-full sm:w-32 text-sm">
                  <SelectValue placeholder={t('projectGraph.toolbar.filterStatus') || '状态筛选'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('projectGraph.toolbar.allStatus') || '全部'}</SelectItem>
                  <SelectItem value="visible">{t('projects.status.visible') || '可见'}</SelectItem>
                  <SelectItem value="hidden">{t('projects.status.hidden') || '隐藏'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 flex-1 min-h-0 overflow-hidden">
            <div className="flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-2 flex-shrink-0 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t('projectGraph.chart.title') || '关系图'}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleResetView}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-[50px] ml-1">{Math.round(zoom * 100)}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('projectGraph.instructions') || '拖拽画布平移，使用上方按钮缩放或重置'}
                  </p>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                  <div className="relative w-full flex-1 overflow-hidden bg-gray-50/50">
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'rgb(37,99,235)' }}></div>
                          <p className="text-sm text-muted-foreground">{t('projectGraph.loading') || '加载中...'}</p>
                        </div>
                      </div>
                    )}
                    {error && !loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-3 max-w-md text-center">
                          <div className="h-12 w-12 rounded-full" style={{ backgroundColor: 'rgb(254,226,226)' }} />
                          <div>
                            <h3 className="text-lg font-semibold" style={{ color: 'rgb(185,28,28)' }}>{t('projectGraph.error.title') || '加载失败'}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    <svg
                      ref={svgRef}
                      width="100%"
                      height="100%"
                      className="cursor-grab active:cursor-grabbing"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      <g transform={`translate(${400 + pan.x}, ${100 + pan.y}) scale(${zoom})`}>
                        {!loading && !error && renderConnections()}
                        {!loading && !error && allNodes.map(renderNode)}
                      </g>
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Main>
    </>
  )
}

export default ProjectRelationshipGraph
