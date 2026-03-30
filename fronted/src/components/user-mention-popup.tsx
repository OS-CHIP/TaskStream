import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
 import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { UserMention, PopupPosition } from '@/types/mention'
import { TaskService } from '@/features/tasks/services/task-service'

interface UserMentionPopupProps {
  isOpen: boolean
  position: PopupPosition
  searchQuery: string
  onSelect: (user: UserMention) => void
  onClose: () => void
  onSearchChange: (query: string) => void
  projectId?: string
  className?: string
  highlightTags?: Record<string | number, string | string[]>
}

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

interface UserItemProps {
  user: UserMention
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
  tagLabels?: string[]
}

const UserItem: React.FC<UserItemProps> = ({ user, isSelected, onClick, onMouseEnter, tagLabels }) => {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isSelected && 'bg-accent text-accent-foreground'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">{user.name}</span>
          {Array.isArray(tagLabels) && tagLabels.map((label, idx) => (
            <Badge key={`${user.id}-${idx}`} variant="outline" className="text-[10px] px-1 py-0.5">
              {label}
            </Badge>
          ))}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {user.email || `ID: ${user.id}`}
        </div>
      </div>
    </div>
  )
}

export const UserMentionPopup: React.FC<UserMentionPopupProps> = ({
  isOpen,
  position,
  searchQuery,
  onSelect,
  onClose,
  onSearchChange,
  projectId,
  className,
  highlightTags
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [internalSearchQuery, setInternalSearchQuery] = useState(searchQuery)
  const [users, setUsers] = useState<UserMention[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const popupRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const getTagLabels = useCallback(
    (id: string | number): string[] | undefined => {
      if (!highlightTags) return undefined
      const v = highlightTags[id] ?? highlightTags[String(id)]
      if (!v) return undefined
      return Array.isArray(v) ? v : [v]
    },
    [highlightTags]
  )

  // 搜索用户
  const searchUsers = useCallback(async (query: string) => {
    if (!projectId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const results = await TaskService.searchProjectUsers(projectId, query)
      setUsers(results)
    } catch (err) {
      console.error('搜索用户失败:', err)
      setError('搜索用户失败')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 处理搜索输入变化（带防抖）
  const handleSearchChange = useCallback((value: string) => {
    setInternalSearchQuery(value)
    onSearchChange(value)
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    
    debounceTimerRef.current = setTimeout(() => {
      searchUsers(value)
    }, 300)
    
    setSelectedIndex(0)
  }, [onSearchChange, searchUsers])

  // 初始搜索
  useEffect(() => {
    if (isOpen && projectId) {
      searchUsers(searchQuery)
    }
  }, [isOpen, projectId]) // Removed searchQuery to avoid double search on mount if handleSearchChange triggers it

  // 处理键盘导航
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, users.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, 0))
        break
      case 'Enter':
        event.preventDefault()
        if (users[selectedIndex]) {
          onSelect(users[selectedIndex])
        }
        break
      case 'Escape':
        event.preventDefault()
        onClose()
        break
    }
  }, [isOpen, users, selectedIndex, onSelect, onClose])

  // 监听键盘事件
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [isOpen, handleKeyDown])

  // 监听外部点击关闭弹窗
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  // 自动聚焦搜索框
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // 同步外部搜索查询
  useEffect(() => {
    if (searchQuery !== internalSearchQuery) {
      setInternalSearchQuery(searchQuery)
    }
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <div
      ref={popupRef}
      className={cn(
        'absolute z-50 w-80 bg-popover border border-border rounded-lg shadow-lg',
        'animate-in fade-in-0 zoom-in-95 flex flex-col',
        className
      )}
      style={{
        left: position.x,
        top: position.y,
        maxHeight: 'min(300px, 40vh)',
        minHeight: '200px'
      }}
    >
      {/* 搜索框 */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            value={internalSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="搜索成员..."
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* 用户列表 */}
      <ScrollArea className="flex-1 overflow-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
        {loading && (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">搜索中...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {internalSearchQuery ? '未找到相关成员' : '暂无成员'}
            </p>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="py-1">
            {users.map((user, index) => (
              <UserItem
                key={user.id}
                user={user}
                isSelected={index === selectedIndex}
                onClick={() => onSelect(user)}
                onMouseEnter={() => setSelectedIndex(index)}
                tagLabels={getTagLabels(user.id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* 底部提示 */}
      <div className="px-3 py-2 border-t border-border bg-muted/50">
        <p className="text-xs text-muted-foreground">
          ↑↓ 选择 • Enter 确认 • Esc 取消
        </p>
      </div>
    </div>
  )
}
