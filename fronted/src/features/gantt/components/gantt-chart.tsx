import { useEffect, useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, Legend, Cell, CartesianGrid, ReferenceLine } from 'recharts'
import { useGantt } from '@/features/gantt/hooks/useGantt'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TaskService } from '@/features/tasks/services/task-service'

const statusColors: Record<string, string> = {
  '1': '#9CA3AF', // TODO - gray
  '2': '#3B82F6', // IN_PROGRESS - blue
  '3': '#10B981', // DONE - green
  '4': '#EF4444', // CANCELED - red
  '5': '#F59E0B', // BLOCKED - amber
}

const statusText: Record<string, string> = {
  '1': '待开始',
  '2': '进行中',
  '3': '已完成',
  '4': '已取消',
  '5': '已阻塞',
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function GanttChart() {
  const [query, setQuery] = useState('')
  const { items, range, loading, error, reload } = useGantt({ taskTitle: query.trim() })
  const [view, setView] = useState<'task' | 'member'>('task')
  const [members, setMembers] = useState<Array<{ label: string; value: number }>>([])
  const [selectedMember, setSelectedMember] = useState<string>('')

  useEffect(() => {
    const projectId = localStorage.getItem('selected_project_id') || ''
    if (!projectId) return
    let mounted = true
    TaskService.getProjectUsers(projectId).then((list) => {
      if (mounted) setMembers(list)
    })
    return () => { mounted = false }
  }, [])

  const chartHeight = useMemo(() => {
    const rows = Math.max(items.length, 5)
    return rows * 40 + 80
  }, [items.length])

  const data = useMemo(() => {
    return items
      .map(i => ({
        name: i.name,
        startTS: i.startTS,
        duration: i.duration,
        status: i.status,
        assignee: i.assignee,
      }))
      .filter(d => Number.isFinite(d.startTS) && Number.isFinite(d.duration))
  }, [items])

  const memberNameMap = useMemo(() => {
    const map: Record<number, string> = {}
    for (const m of members) {
      map[m.value] = m.label
    }
    return map
  }, [members])

  const dataMember = useMemo(() => {
    const isSpecific = selectedMember !== '' && selectedMember !== 'all'
    let arr = data.map(d => ({
      ...d,
      assigneeName: memberNameMap[d.assignee || -1] || '未分配',
      name: (isSpecific ? d.name : `${memberNameMap[d.assignee || -1] || '未分配'}｜${d.name}`),
    }))
    if (isSpecific) {
      const sel = Number(selectedMember)
      arr = arr.filter(d => (d.assignee || -1) === sel)
    }
    return arr.sort((a, b) => {
      const an = a.assigneeName.localeCompare(b.assigneeName)
      if (an !== 0) return an
      return a.startTS - b.startTS
    })
  }, [data, memberNameMap, selectedMember])

  const xDomain = useMemo(() => {
    if (!range) return undefined
    const pad = Math.max(1, Math.round((range.max - range.min) * 0.05))
    let min = range.min - pad
    let max = range.max + pad
    if (min === max) {
      max = min + 24 * 60 * 60 * 1000
    }
    return [min, max] as [number, number]
  }, [range])

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索任务标题"
          className="max-w-xs"
        />
        <Button variant="outline" onClick={() => reload()} disabled={loading}>
          <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Tabs value={view} onValueChange={(v) => setView(v as 'task' | 'member')}>
            <TabsList>
              <TabsTrigger value="task">按任务</TabsTrigger>
              <TabsTrigger value="member">按成员</TabsTrigger>
            </TabsList>
          </Tabs>
          {view === 'member' && (
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="选择成员" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部成员</SelectItem>
                {members.map(m => (
                  <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {(view === 'task' ? data.length === 0 : dataMember.length === 0) && !loading && (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          无可渲染的任务（需同时包含开始与结束时间）
        </div>
      )}

      {(view === 'task' ? data.length > 0 : dataMember.length > 0) && (
        <div className="flex-1 overflow-auto">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={view === 'task' ? data : dataMember} layout="vertical" margin={{ left: 96, right: 24, top: 24, bottom: 24 }}>
              <defs>
                {Object.entries(statusColors).map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <ReferenceLine x={Date.now()} stroke="#6B7280" strokeDasharray="4 4" label={{ value: '今天', position: 'insideTopRight', fill: '#6B7280', fontSize: 12 }} />
              <XAxis
                xAxisId="x"
                type="number"
                dataKey="startTS"
                allowDataOverflow
                tickFormatter={(value: number) => formatDate(value)}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                {...(xDomain ? { domain: xDomain } : { domain: ['dataMin', 'dataMax'] })}
              />
              <YAxis yAxisId="y" type="category" dataKey="name" width={view === 'task' ? 160 : 200} tick={{ fontSize: 12, fill: '#374151' }} />
              <Tooltip
                formatter={(value: any, name: any, props: any) => {
                  if (name === 'duration') {
                    const start = props && props.payload ? props.payload.startTS : 0
                    const end = start + (value as number)
                    const s = props?.payload?.status
                    const assigneeName = props?.payload?.assigneeName
                    const extra = [statusText[s] || '', assigneeName ? `｜${assigneeName}` : ''].filter(Boolean).join(' ')
                    return [`${formatDate(start)} ~ ${formatDate(end)}${extra ? `（${extra}）` : ''}`, '计划']
                  }
                  return [value, name]
                }}
                labelFormatter={(label: any) => label}
              />
              <Legend />
              <Bar xAxisId="x" yAxisId="y" dataKey="startTS" stackId="plan" isAnimationActive={false} fill="transparent" />
              <Bar xAxisId="x" yAxisId="y" dataKey="duration" stackId="plan" name="计划" isAnimationActive={false} radius={[8, 8, 8, 8]}>
                {(view === 'task' ? data : dataMember).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#grad-${entry.status})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
