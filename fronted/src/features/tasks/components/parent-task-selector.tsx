import { useState, useEffect, useMemo, useRef } from 'react'

import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { TaskService } from '../services/task-service'
import { getParentTasks } from '../services/task-detail-service'
import { useProjectSwitcher } from '@/components/layout/project-switcher'

interface ParentTaskOption {
  label: string
  value: string
  id: number
}

interface ParentTaskSelectorProps {
  value?: Array<string | { id: string; title: string }>
  onValueChange: (value: Array<string | { id: string; title: string }>) => void
  placeholder?: string
  disabled?: boolean
  editTaskId?: string // 编辑模式下的任务ID，用于获取父任务列表
}

export function ParentTaskSelector({
  value = [],
  onValueChange,
  placeholder = '选择父任务',
  disabled = false,
  editTaskId,
}: ParentTaskSelectorProps) {

  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [tasks, setTasks] = useState<ParentTaskOption[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { currentProject } = useProjectSwitcher()
  
  // 添加 ref 来跟踪已加载的编辑任务ID，防止重复请求
  const loadedEditTaskIdRef = useRef<string | null>(null)
  const isLoadingParentTasksRef = useRef(false)

  // 将值转换为字符串数组以便处理
  const selectedValues = useMemo(() => {
    return value.map(item => typeof item === 'string' ? item : item.id)
  }, [value])

  // 判断是否为编辑模式
  const isEditMode = Boolean(editTaskId)

  // 获取任务列表
  const fetchTasks = async (search?: string) => {
    if (!currentProject?.id) return
    
    setIsLoading(true)
    try {
      const response = await TaskService.searchParentTasks({
        projectId: currentProject.id.toString(),
        search: search || '',
        pageSize: 20,
      })
      
      const taskOptions: ParentTaskOption[] = response.records.map((task: any) => ({
        label: task.taskTitle,
        value: task.id.toString(),
        id: task.id,
      }))
      
      // 保持已选择的任务，合并搜索结果
        setTasks(prevTasks => {
          // 获取当前已选择的任务
          const selectedTasks = prevTasks.filter(task => selectedValues.includes(task.value))
          
          // 合并已选择的任务和搜索结果，已选择的任务在前
          const mergedTasks = [
            ...selectedTasks,
            ...taskOptions.filter(task => !selectedTasks.some(selected => selected.value === task.value))
          ]
          
          return mergedTasks
        })
    } catch (error) {
      console.error('Failed to fetch parent tasks:', error)
      // 即使出错也要保持已选择的任务
      setTasks(prevTasks => prevTasks.filter(task => selectedValues.includes(task.value)))
    } finally {
      setIsLoading(false)
    }
  }

  // 初始加载 - 只在打开时加载，避免与搜索useEffect重复
  useEffect(() => {
    if (open && searchValue === '') {
      // 只有在没有搜索值时才执行初始加载，避免与搜索useEffect冲突
      fetchTasks()
    } else if (!open && selectedValues.length > 0) {
      // 当关闭时，如果有已选择的值，确保它们在任务列表中
      const loadMissingTasks = async () => {
        const missingTaskIds = selectedValues.filter(id => 
          !tasks.find(task => task.value === id)
        )
        
        if (missingTaskIds.length > 0) {
          fetchTasks()
        }
      }
      loadMissingTasks()
    }
  }, [open, currentProject?.id])

  // 搜索节流处理 - 只在有搜索值时执行
  useEffect(() => {
    if (!open || searchValue === '') return
    
    const timer = setTimeout(() => {
      fetchTasks(searchValue)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchValue, currentProject?.id])

  // 直接使用后端API返回的任务列表，不进行前端过滤
  const displayTasks = tasks

  // 获取已选择的任务
  const selectedTasks = useMemo(() => {
    return tasks.filter(task => selectedValues.includes(task.value))
  }, [tasks, selectedValues])

  // 编辑模式下加载父任务列表进行回显
  useEffect(() => {
    const loadParentTasksForEdit = async () => {
      // 添加更严格的条件判断
      if (!editTaskId || !currentProject?.id) return
      
      // 防止重复请求：如果已经加载过相同的任务ID，或者正在加载中，则跳过
      if (loadedEditTaskIdRef.current === editTaskId || isLoadingParentTasksRef.current) {
        return
      }
      
      try {
        isLoadingParentTasksRef.current = true
        setIsLoading(true)
        const parentTasks = await getParentTasks(editTaskId)
        
        // 记录已加载的任务ID
        loadedEditTaskIdRef.current = editTaskId
        
        // 将父任务转换为选项格式
        const parentTaskOptions: ParentTaskOption[] = parentTasks.map(task => ({
          label: task.title,
          value: task.id,
          id: parseInt(task.id),
        }))
        
        // 将父任务添加到任务列表中（避免重复）
        setTasks(prevTasks => {
          const existingIds = new Set(prevTasks.map(t => t.value))
          const newTasks = parentTaskOptions.filter(t => !existingIds.has(t.value))
          return [...newTasks, ...prevTasks]
        })
        
        // 如果当前 value 为空，自动设置为父任务列表
        if (value.length === 0 && parentTasks.length > 0) {
          const first = parentTasks[0]
          onValueChange([{ id: first.id, title: first.title }])
        }
      } catch (error) {
        console.error('Failed to load parent tasks for edit:', error)
      } finally {
        setIsLoading(false)
        isLoadingParentTasksRef.current = false
      }
    }
    
    loadParentTasksForEdit()
  }, [editTaskId, currentProject?.id])

  useEffect(() => {
    if (value.length > 1) {
      const firstId = typeof value[0] === 'string' ? value[0] : value[0].id
      const firstTask = tasks.find(t => t.value === firstId)
      const firstTitle = typeof value[0] === 'string' ? (firstTask?.label ?? '') : value[0].title
      onValueChange([{ id: firstId, title: firstTitle }])
    }
  }, [value, tasks])

  // 当 editTaskId 变化时，重置已加载的记录
  useEffect(() => {
    if (!editTaskId) {
      loadedEditTaskIdRef.current = null
    }
  }, [editTaskId])

  // 加载缺失的已选择任务 - 优化以避免不必要的请求
  useEffect(() => {
    const loadMissingTasks = async () => {
      if (!currentProject?.id || selectedValues.length === 0) return
      
      const missingTaskIds = selectedValues.filter(id => 
        !tasks.find(task => task.value === id)
      )
      
      if (missingTaskIds.length === 0) return
      
      // 避免在组件初始化时立即触发，给其他useEffect一些时间先执行
      const timer = setTimeout(async () => {
        try {
          const missingTasks = await Promise.all(
            missingTaskIds.map(async (id) => {
              try {
                const taskDetail = await TaskService.getTaskDetail(id)
                return {
                  label: taskDetail.title,
                  value: taskDetail.id,
                  id: parseInt(taskDetail.id),
                }
              } catch (error) {
                console.error(`Failed to load task ${id}:`, error)
                return null
              }
            })
          )
          
          const validMissingTasks = missingTasks.filter((task): task is ParentTaskOption => task !== null)
          
          if (validMissingTasks.length > 0) {
            setTasks(prevTasks => {
              const existingIds = new Set(prevTasks.map(t => t.value))
              const newTasks = validMissingTasks.filter(t => !existingIds.has(t.value))
              return [...newTasks, ...prevTasks]
            })
          }
        } catch (error) {
          console.error('Failed to load missing tasks:', error)
        }
      }, 100) // 延迟100ms执行，避免与其他useEffect冲突
      
      return () => clearTimeout(timer)
    }
    
    loadMissingTasks()
  }, [selectedValues, currentProject?.id])

  // 处理任务选择
  const handleTaskSelect = (taskValue: string) => {
    const task = tasks.find(t => t.value === taskValue)
    if (!task) return

    const isSelected = selectedValues.includes(taskValue)
    
    if (isSelected) {
      // 移除任务
      const newValue = value.filter(item => {
        const itemId = typeof item === 'string' ? item : item.id
        return itemId !== taskValue
      })
      onValueChange(newValue)
    } else {
      const newValue = [{ id: task.value, title: task.label }]
      onValueChange(newValue)
    }
  }

  // 移除单个任务
  const handleRemoveTask = (taskValue: string) => {
    const newValue = value.filter(item => {
      const itemId = typeof item === 'string' ? item : item.id
      return itemId !== taskValue
    })
    onValueChange(newValue)
  }

  // 清空所有选择
  const handleClearAll = () => {
    onValueChange([])
  }

  return (
    <div className="space-y-2">
      {/* 已选择的任务显示 */}
      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTasks.map((task) => (
            <Badge
              key={task.value}
              variant="secondary"
              className={cn(
                "flex items-center gap-1",
                isEditMode ? "pr-2" : "pr-1"
              )}
            >
              <span className="text-xs">{task.label}</span>
              {!isEditMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveTask(task.value)}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
          {selectedTasks.length > 0 && !isEditMode && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleClearAll}
              disabled={disabled}
            >
              清空
            </Button>
          )}
        </div>
      )}

      {/* 选择器 */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between user-input-display"
            disabled={disabled}
          >
            {selectedTasks.length > 0 ? selectedTasks[0].label : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="搜索任务标题..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? '加载中...' : '未找到任务'}
              </CommandEmpty>
              <CommandGroup>
                {displayTasks.map((task) => {
                  const isSelected = selectedValues.includes(task.value)
                  return (
                    <CommandItem
                      key={task.label+task.value}
                      value={task.value}
                      onSelect={() => handleTaskSelect(task.value)}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          isSelected ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      {task.label}
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
