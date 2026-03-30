import { useTranslation } from 'react-i18next'
import { useState, useRef, useEffect, useMemo } from 'react'
import { 
  format, 
  addDays, 
  eachDayOfInterval, 
  isToday,
  differenceInDays
} from 'date-fns'
import { 
  Calendar as CalendarIcon 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { getGanttData, parseDateTime, formatDateLocal } from '@/features/gantt/services/gantt.service'
import { TaskService } from '@/features/tasks/services/task-service'

// --- Types & Mock Data ---

type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked' | 'review'

interface Task {
  id: string
  title: string
  assignee: {
    name: string
    avatar?: string
    initials: string
  }
  status: TaskStatus
  startDate: Date
  endDate: Date
  progress: number
  priority: 'low' | 'medium' | 'high'
}

const STATUS_MAP: Record<string, TaskStatus> = {
  '1': 'todo',
  '2': 'in_progress',
  '3': 'done',
  '4': 'todo',
  '5': 'blocked',
  '100': 'todo',
  'todo': 'todo',
  'in_progress': 'in_progress',
  'in progress': 'in_progress',
  'done': 'done',
  'blocked': 'blocked',
}

const PRIORITY_MAP: Record<string, 'low' | 'medium' | 'high'> = {
  '1': 'low',
  '2': 'medium',
  '3': 'high',
  'low': 'low',
  'medium': 'medium',
  'high': 'high',
}


const PRIORITY_CONFIG = {
  low: { label: '低', color: 'bg-slate-400' },
  medium: { label: '中', color: 'bg-amber-400' },
  high: { label: '高', color: 'bg-red-400' },
}

const STATUS_COLOR_HEX: Record<TaskStatus, { bg: string; border: string }> = {
  done: { bg: '#10B981', border: '#059669' },
  in_progress: { bg: '#3B82F6', border: '#2563EB' },
  blocked: { bg: '#EF4444', border: '#DC2626' },
  todo: { bg: '#9CA3AF', border: '#6B7280' },
  review: { bg: '#8B5CF6', border: '#7C3AED' },
}

// --- Components ---

export function GanttChartNew() {
  const { t } = useTranslation()
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day')
  const [tasks, setTasks] = useState<Task[]>([])
  const [timelineRange, setTimelineRange] = useState<{ start: Date; end: Date } | null>(null)

  const VISIBLE_TASKS = tasks
  const DEFAULT_START = useMemo(() => addDays(new Date(), -30), [])
  const DEFAULT_END = useMemo(() => addDays(new Date(), 14), [])
  
  // Add some padding to the range
  const startDate = timelineRange?.start || DEFAULT_START
  const endDate = timelineRange?.end || DEFAULT_END

  const days = useMemo(() => {
    return eachDayOfInterval({ start: startDate, end: endDate })
  }, [startDate, endDate])

  const CELL_WIDTH = 50
  const HEADER_HEIGHT = 50
  const MIN_ROW_HEIGHT = 36
  const MAX_ROW_HEIGHT = 56
  const LEFT_PANEL_WIDTH = 320
  const HEADER_OUTER_HEIGHT = 104

  const todayOffsetDays = differenceInDays(new Date(), startDate)
  const showTodayLine = todayOffsetDays >= 0 && todayOffsetDays < days.length
  
  // Dynamic status config with translation
  const statusConfig = useMemo(() => ({
    todo: { label: t('tasks.status.todo'), color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' },
    in_progress: { label: t('tasks.status.inProgress'), color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    done: { label: t('tasks.status.done'), color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
    blocked: { label: t('tasks.status.blocked'), color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
    review: { label: t('tasks.status.backlog'), color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' }, // Using backlog for review as fallback or add review to locales
  }), [t])

  const containerRef = useRef<HTMLDivElement>(null)
  const [rowHeight, setRowHeight] = useState<number>(56)
  const [containerHeight, setContainerHeight] = useState<number>(0)

  useEffect(() => {
    let mounted = true
    const projectId = localStorage.getItem('selected_project_id') || ''
    const now = new Date()
    const startTS = viewMode === 'day' ? now : (viewMode === 'week' ? addDays(now, -7) : addDays(now, -30))
    const endTS = now
    const startStr = formatDateLocal(startTS)
    const endStr = formatDateLocal(endTS)
    Promise.all([
      getGanttData(projectId, startStr, endStr),
      projectId ? TaskService.getProjectUsers(projectId) : Promise.resolve([]),
    ])
      .then(([list, users]) => {
        if (!mounted) return
        const map: Record<number, string> = {}
        for (const u of users) map[u.value] = u.label
        const toInitials = (name: string) => {
          const s = name.trim()
          if (!s) return 'U'
          const parts = s.split(/\s+/)
          if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
          return s.slice(0, 2).toUpperCase()
        }
        const normalized: Task[] = (list || [])
          .map((it) => {
            const start = parseDateTime(String(it.startTime || ''))
            const end = parseDateTime(String(it.dueDate || ''))
            if (!start || !end) return null
            const assigneeId = it.assignee ? Number(it.assignee) : NaN
            const assigneeName = Number.isFinite(assigneeId) && map[assigneeId] ? map[assigneeId] : ''
            return {
              id: String(it.id ?? it.taskCode ?? it.taskTitle),
              title: String(it.taskTitle || it.taskCode || ''),
              assignee: {
                name: assigneeName || '',
                avatar: undefined,
                initials: assigneeName ? toInitials(assigneeName) : 'U',
              },
              status: STATUS_MAP[String(it.status || 'todo')] || 'todo',
              startDate: start,
              endDate: end,
              progress: typeof it.completionPercentage === 'number' ? it.completionPercentage : Number(it.completionPercentage || 0),
              priority: PRIORITY_MAP[String(it.priority || 'medium')] || 'medium',
            }
          })
          .filter(Boolean) as Task[]
        setTasks(normalized)
        if (!timelineRange && normalized.length > 0) {
          const min = new Date(Math.min(...normalized.map(t => t.startDate.getTime())))
          const max = new Date(Math.max(...normalized.map(t => t.endDate.getTime())))
          setTimelineRange({ start: addDays(min, -7), end: addDays(max, 14) })
        }
      })
      .catch(() => {})
      .finally(() => {
        // no-op
      })
    return () => { mounted = false }
  }, [viewMode])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      // Ctrl + Wheel to Zoom
      if (e.ctrlKey) {
        e.preventDefault()
        if (e.deltaY > 0) {
           // Zoom Out
           setViewMode(prev => prev === 'day' ? 'week' : prev === 'week' ? 'month' : 'month')
        } else {
           // Zoom In
           setViewMode(prev => prev === 'month' ? 'week' : prev === 'week' ? 'day' : 'day')
        }
        return
      }
      
      // Shift + Wheel (Native horizontal scroll usually handles this, but let's ensure)
      // If we want to force horizontal scroll on vertical wheel (common in timeline apps):
      // Uncomment below if desired, but standard is Shift+Wheel.
      /*
      if (e.deltaY !== 0 && !e.shiftKey) {
        // e.preventDefault()
        // container.scrollLeft += e.deltaY
      }
      */
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [])

  useEffect(() => {
    const computeRowHeight = () => {
      const container = containerRef.current
      if (!container) return
      const available = container.clientHeight - HEADER_HEIGHT
      const count = VISIBLE_TASKS.length
      if (available > 0 && count > 0) {
        const hRaw = Math.max(MIN_ROW_HEIGHT, Math.floor(available / count))
        const h = Math.min(hRaw, MAX_ROW_HEIGHT)
        setRowHeight(h)
      }
    }
    computeRowHeight()
    window.addEventListener('resize', computeRowHeight)
    return () => window.removeEventListener('resize', computeRowHeight)
  }, [HEADER_HEIGHT, VISIBLE_TASKS.length])

  useEffect(() => {
    const applyContainerHeight = () => {
      const viewport = window.innerHeight || document.documentElement.clientHeight
      const h = Math.max(0, viewport - HEADER_OUTER_HEIGHT)
      setContainerHeight(h)
    }
    applyContainerHeight()
    window.addEventListener('resize', applyContainerHeight)
    return () => window.removeEventListener('resize', applyContainerHeight)
  }, [])

  return (
    <div className="flex min-h-0 flex-col bg-white overflow-hidden rounded-lg border shadow-sm" style={{ height: `${containerHeight}px` }}>
      {/* --- Toolbar --- */}
      <div className="flex items-center justify-between border-b px-6 py-4 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
             <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <CalendarIcon className="h-5 w-5 text-white" />
             </div>
            <h1 className="text-xl font-bold text-slate-900">{t('gantt.title', { defaultValue: '任务进度概览' })}</h1>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <div className="flex items-center gap-2 rounded-md border bg-slate-50 p-1">
            <Button 
              variant={viewMode === 'day' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-7 px-3 text-xs font-medium", viewMode === 'day' && "shadow-sm")}
              onClick={() => setViewMode('day')}
            >
              {t('common.dayView', { defaultValue: '日视图' })}
            </Button>
            <Button 
              variant={viewMode === 'week' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-7 px-3 text-xs font-medium", viewMode === 'week' && "shadow-sm")}
              onClick={() => setViewMode('week')}
            >
              {t('common.weekView', { defaultValue: '周视图' })}
            </Button>
            <Button 
              variant={viewMode === 'month' ? 'secondary' : 'ghost'} 
              size="sm" 
              className={cn("h-7 px-3 text-xs font-medium", viewMode === 'month' && "shadow-sm")}
              onClick={() => setViewMode('month')}
            >
              {t('common.monthView', { defaultValue: '月视图' })}
            </Button>
          </div>
        </div>
      </div>

      {/* --- Main Content (Unified Scroll Container) --- */}
      <div ref={containerRef} className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden relative">
        <div className="min-w-max">
          
          {/* Header Row (Sticky Top) */}
          <div className="sticky top-0 z-40 flex h-[50px] bg-white border-b shadow-sm">
             {/* Left Header (Sticky Left) */}
             <div className="sticky left-0 z-50 w-[320px] bg-white border-r flex items-center px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider shrink-0 shadow-sm">
                <div className="flex-1">{t('tasks.columns.title')}</div>
                <div className="w-20 text-center">{t('tasks.columns.status')}</div>
                <div className="w-16 text-center">{t('tasks.columns.assignee')}</div>
             </div>
             
             {/* Timeline Header (Scrolls with content) */}
             <div className="flex">
                {days.map((day, i) => {
                  const isFirstDayOfMonth = day.getDate() === 1
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6
                  
                  return (
                    <div 
                      key={day.toISOString()} 
                      className={cn(
                        "flex flex-col items-center justify-center border-r border-slate-100 text-xs transition-colors shrink-0",
                        isWeekend ? "bg-slate-50/80" : "bg-white",
                        isToday(day) && "bg-blue-50/50"
                      )}
                      style={{ width: `${CELL_WIDTH}px` }}
                    >
                      {(isFirstDayOfMonth || i === 0) && (
                         <div className="absolute top-1 left-1 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {format(day, 'MMM yyyy')}
                         </div>
                      )}
                      
                      <div className={cn("mt-2 font-medium", isToday(day) ? "text-blue-600 font-bold" : "text-slate-600")}>
                        {format(day, 'd')}
                      </div>
                      <div className="text-[9px] text-slate-400 uppercase">
                        {format(day, 'EEE')}
                      </div>
                    </div>
                  )
                })}
             </div>
          </div>

          {/* Grid Background (Absolute to container) */}
          {/* We put grid lines inside the row relative container instead, for simpler stacking context handling */}

          {/* Task Rows */}
          <div className="relative">
             {/* Global Grid Lines (Background) */}
             <div className="absolute inset-0 z-0 flex pointer-events-none" style={{ paddingLeft: `${LEFT_PANEL_WIDTH}px` }}>
                {days.map((day) => (
                   <div 
                      key={`grid-${day.toISOString()}`}
                      className={cn(
                        "h-full border-r border-slate-100/80 shrink-0",
                        (day.getDay() === 0 || day.getDay() === 6) && "bg-slate-50/30"
                      )}
                      style={{ width: `${CELL_WIDTH}px` }}
                   />
                ))}
                 {/* Today Marker Line */}
                {showTodayLine && (
                  <div 
                    className="absolute top-0 bottom-0 z-10 w-px bg-red-500 shadow-sm"
                    style={{ left: `${todayOffsetDays * CELL_WIDTH + CELL_WIDTH / 2 + LEFT_PANEL_WIDTH}px` }}
                  >
                    <div className="sticky top-[50px] left-0 -translate-x-1/2 rounded bg-red-500 px-1 py-0.5 text-[9px] font-bold text-white w-max">
                       {t('common.today', { defaultValue: '今天' })}
                    </div>
                  </div>
                )}
             </div>

             {/* Rows */}
             {VISIBLE_TASKS.map((task, index) => (
               <div 
                 key={task.id} 
                 className={cn(
                   "relative z-10 flex border-b border-slate-100/50 hover:bg-slate-50/50 transition-colors",
                   index % 2 === 0 ? "bg-white/50" : "bg-slate-50/30"
                 )}
                 style={{ height: `${rowHeight}px` }}
               >
                  {/* Left Sticky Column */}
                  <div className="sticky left-0 z-30 w-[320px] bg-white border-r flex items-center px-4 shrink-0 shadow-sm group-hover:bg-slate-50">
                    <div className="flex flex-1 items-center gap-3 overflow-hidden">
                      <div className={cn("h-2 w-2 rounded-full shrink-0", PRIORITY_CONFIG[task.priority].color)} />
                      <span className="truncate text-sm font-medium text-slate-700">{task.title}</span>
                    </div>
                    
                    <div className="w-20 flex justify-center">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "h-5 px-1.5 text-[10px] font-medium border", 
                          statusConfig[task.status].bg,
                          statusConfig[task.status].color,
                          statusConfig[task.status].border
                        )}
                      >
                        {statusConfig[task.status].label}
                      </Badge>
                    </div>

                    <div className="w-16 flex justify-center">
                       <Avatar className="h-6 w-6 border-2 border-white ring-1 ring-slate-100">
                        <AvatarImage src={task.assignee.avatar} />
                        <AvatarFallback className="text-[9px] bg-indigo-50 text-indigo-600 font-bold">
                          {task.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  
                  {/* Right Timeline Part (Bar) */}
                  <div className="relative flex-1" style={{ width: `${days.length * CELL_WIDTH}px` }}> 
                     {/* The Bar */}
                     {(() => {
                        const offsetDays = differenceInDays(task.startDate, startDate)
                        const durationDays = differenceInDays(task.endDate, task.startDate) + 1
                        const left = offsetDays * CELL_WIDTH
                        const width = durationDays * CELL_WIDTH
                        
                        return (
                           <div
                              className={cn(
                                "absolute top-1/2 -translate-y-1/2 h-8 rounded-md shadow-sm border opacity-90 hover:opacity-100 transition-all cursor-pointer group flex items-center overflow-hidden z-20"
                              )}
                              style={{ 
                                left: `${left}px`, 
                                width: `${width}px`,
                                marginLeft: '2px', // gap
                                marginRight: '2px',
                                backgroundColor: STATUS_COLOR_HEX[task.status].bg,
                                borderColor: STATUS_COLOR_HEX[task.status].border 
                              }}
                           >
                              {/* Progress Fill */}
                              <div 
                                className="absolute left-0 top-0 bottom-0 bg-white/20" 
                                style={{ width: `${task.progress}%` }} 
                              />
                              
                              {/* Label inside bar if wide enough */}
                              {width > 60 && (
                                 <span className="relative z-10 ml-2 truncate text-xs font-medium text-white drop-shadow-sm">
                                    {task.title}
                                 </span>
                              )}

                              {/* Hover Details */}
                              <div className="absolute left-full top-0 ml-2 hidden group-hover:flex items-center gap-2 bg-slate-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                                <span>{task.progress}% {t('tasks.status.completed', { defaultValue: '完成' })}</span>
                                <span className="opacity-50">|</span>
                                <span>{format(task.startDate, 'MM-dd')} - {format(task.endDate, 'MM-dd')}</span>
                              </div>
                           </div>
                        )
                     })()}
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
