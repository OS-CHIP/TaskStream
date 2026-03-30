import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { TaskMentionPopup } from './task-mention-popup'
import { TaskMention, MentionConfig, DEFAULT_MENTION_CONFIG, PopupPosition } from '@/types/mention'
import { cn } from '@/lib/utils'

interface EnhancedMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  rows?: number
  mentionConfig?: Partial<MentionConfig>
  projectId?: string
  onMentionSelect?: (task: TaskMention) => void
}

export const EnhancedMarkdownEditor: React.FC<EnhancedMarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = '输入内容...',
  className,
  disabled = false,
  rows = 4,
  mentionConfig = {},
  projectId,
  onMentionSelect
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionSearchQuery, setMentionSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({ x: 0, y: 0 })
  const [mentionStartPos, setMentionStartPos] = useState<number>(-1)

  // 合并配置
  const config: MentionConfig = { ...DEFAULT_MENTION_CONFIG, ...mentionConfig }



  // 计算弹窗位置
  const calculatePopupPosition = useCallback((cursorPos: number): PopupPosition => {
    const textarea = textareaRef.current
    if (!textarea) return { x: 0, y: 0 }

    // 创建一个临时的div来计算文本位置
    const tempDiv = document.createElement('div')
    const computedStyle = window.getComputedStyle(textarea)
    
    // 复制textarea的样式到临时div
    tempDiv.style.position = 'absolute'
    tempDiv.style.visibility = 'hidden'
    tempDiv.style.whiteSpace = 'pre-wrap'
    tempDiv.style.wordWrap = 'break-word'
    tempDiv.style.font = computedStyle.font
    tempDiv.style.padding = computedStyle.padding
    tempDiv.style.border = computedStyle.border
    tempDiv.style.width = computedStyle.width
    tempDiv.style.height = 'auto'
    tempDiv.style.overflow = 'hidden'

    // 获取光标前的文本
    const textBeforeCursor = value.substring(0, cursorPos)
    tempDiv.textContent = textBeforeCursor

    // 添加一个span来标记光标位置
    const cursorSpan = document.createElement('span')
    cursorSpan.textContent = '|'
    tempDiv.appendChild(cursorSpan)

    document.body.appendChild(tempDiv)

    // 获取textarea的位置
    const textareaRect = textarea.getBoundingClientRect()
    const cursorSpanRect = cursorSpan.getBoundingClientRect()

    // 计算弹窗位置
    const x = textareaRect.left + (cursorSpanRect.left - tempDiv.getBoundingClientRect().left)
    const y = textareaRect.top + (cursorSpanRect.top - tempDiv.getBoundingClientRect().top) + 25

    // 清理临时元素
    document.body.removeChild(tempDiv)

    // 获取textarea的父容器信息
    const textareaParent = textarea.parentElement
    const parentRect = textareaParent ? textareaParent.getBoundingClientRect() : null
    
    // 计算相对于textarea父容器的位置
    let relativeX = x - textareaRect.left
    let relativeY = y - textareaRect.top + 25 // 光标下方25px

    const popupWidth = 320 // 弹窗宽度
    const popupHeight = Math.min(300, window.innerHeight * 0.4) // 弹窗最大高度，不超过视窗40%

    // 确保弹窗不会超出父容器或视窗
    const containerWidth = parentRect ? parentRect.width : textareaRect.width
    const containerHeight = parentRect ? parentRect.height : window.innerHeight

    // 水平位置调整
    if (relativeX + popupWidth > containerWidth) {
      relativeX = Math.max(0, containerWidth - popupWidth - 10)
    }

    // 垂直位置调整 - 如果下方空间不足，显示在上方
    const spaceBelow = containerHeight - (relativeY + textareaRect.height)
    const spaceAbove = relativeY - 25
    
    if (spaceBelow < popupHeight && spaceAbove > popupHeight) {
      relativeY = relativeY - popupHeight - 30 // 显示在光标上方
    }

    return { 
      x: Math.max(0, relativeX), 
      y: Math.max(0, relativeY) 
    }
  }, [value])

  // 检测@符号并显示弹窗
  const checkForMention = useCallback((newValue: string, cursorPos: number) => {
    // 查找光标前最近的@符号
    let mentionStart = -1
    for (let i = cursorPos - 1; i >= 0; i--) {
      const char = newValue[i]
      if (char === config.trigger) {
        mentionStart = i
        break
      }
      // 如果遇到空格或换行，停止搜索
      if (char === ' ' || char === '\n' || char === '\r') {
        break
      }
    }

    if (mentionStart !== -1) {
      // 提取@符号后的搜索查询
      const searchQuery = newValue.substring(mentionStart + 1, cursorPos)
      
      // 检查搜索查询是否有效（不包含空格或换行）
      if (!searchQuery.includes(' ') && !searchQuery.includes('\n')) {
        setMentionStartPos(mentionStart)
        setMentionSearchQuery(searchQuery)
        setPopupPosition(calculatePopupPosition(cursorPos))
        setShowMentionPopup(true)
        return
      }
    }

    // 如果没有找到有效的@提及，隐藏弹窗
    setShowMentionPopup(false)
    setMentionStartPos(-1)
    setMentionSearchQuery('')
  }, [config.trigger, calculatePopupPosition])

  // 处理文本变化
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    const cursorPos = event.target.selectionStart

    onChange(newValue)

    // 检查是否需要显示@提及弹窗
    checkForMention(newValue, cursorPos)
  }, [onChange, checkForMention])

  // 处理键盘事件
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 如果弹窗显示，某些按键由弹窗处理
    if (showMentionPopup) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        case 'Escape':
          // 这些按键由TaskMentionPopup组件处理
          return
      }
    }
  }, [showMentionPopup])

  // 处理光标位置变化
  const handleSelectionChange = useCallback(() => {
    if (!showMentionPopup) return

    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    
    // 检查光标是否还在@提及范围内
    if (mentionStartPos !== -1) {
      if (cursorPos < mentionStartPos || cursorPos > mentionStartPos + mentionSearchQuery.length + 1) {
        setShowMentionPopup(false)
        setMentionStartPos(-1)
        setMentionSearchQuery('')
      }
    }
  }, [showMentionPopup, mentionStartPos, mentionSearchQuery.length])

  // 处理任务选择
  const handleTaskSelect = useCallback((task: TaskMention) => {
    const textarea = textareaRef.current
    if (!textarea || mentionStartPos === -1) return

    // 构建插入的文本
    const linkText = `[${task.title}](${task.url})`
    
    // 计算替换范围
    const beforeMention = value.substring(0, mentionStartPos)
    const afterMention = value.substring(mentionStartPos + mentionSearchQuery.length + 1) // +1 for @
    
    // 构建新的文本
    const newValue = beforeMention + linkText + afterMention
    
    // 更新值
    onChange(newValue)
    
    // 设置光标位置到插入文本的末尾
    const newCursorPos = mentionStartPos + linkText.length
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)

    // 隐藏弹窗
    setShowMentionPopup(false)
    setMentionStartPos(-1)
    setMentionSearchQuery('')

    // 触发回调
    onMentionSelect?.(task)
  }, [value, mentionStartPos, mentionSearchQuery, onChange, onMentionSelect])

  // 处理弹窗关闭
  const handlePopupClose = useCallback(() => {
    setShowMentionPopup(false)
    setMentionStartPos(-1)
    setMentionSearchQuery('')
    
    // 重新聚焦到textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }, [])

  // 处理搜索查询变化
  const handleSearchChange = useCallback((query: string) => {
    setMentionSearchQuery(query)
  }, [])

  // 监听鼠标点击和键盘事件来检测光标位置变化
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const handleSelectionChangeEvent = () => {
      handleSelectionChange()
    }

    textarea.addEventListener('mouseup', handleSelectionChangeEvent)
    textarea.addEventListener('keyup', handleSelectionChangeEvent)

    return () => {
      textarea.removeEventListener('mouseup', handleSelectionChangeEvent)
      textarea.removeEventListener('keyup', handleSelectionChangeEvent)
    }
  }, [handleSelectionChange])

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn('resize-none', className)}
        disabled={disabled}
        rows={rows}
      />
      
      <TaskMentionPopup
        isOpen={showMentionPopup}
        position={popupPosition}
        searchQuery={mentionSearchQuery}
        onSelect={handleTaskSelect}
        onClose={handlePopupClose}
        onSearchChange={handleSearchChange}
        projectId={projectId}
      />
    </div>
  )
}