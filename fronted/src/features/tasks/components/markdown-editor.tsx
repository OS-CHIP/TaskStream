import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { TaskMentionPopup } from '@/components/task-mention-popup'
import { UserMentionPopup } from '@/components/user-mention-popup'
import { TaskMention, UserMention, PopupPosition } from '@/types/mention'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { UploadedFileData } from '@/lib/types/api'
import { useTranslation } from 'react-i18next'
// CSS styles are handled by the component itself

interface MarkdownEditorProps {
  value: string
  onChange: (value?: string) => void
  height?: number
  placeholder?: string
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  height = 200,
  placeholder
}: MarkdownEditorProps) {
  // console.log('MarkdownEditor received value:', value)

  const handleChange = (val?: string) => {
    // console.log('MarkdownEditor onChange:', val)
    onChange(val)
  }

  return (
    <div className="markdown-editor-container">
      <MDEditor
        value={value || ''}
        onChange={handleChange}
        preview="edit"
        hideToolbar={false}
        visibleDragbar={false}
        textareaProps={{
          placeholder: placeholder || '请输入内容... (输入 @ 提及成员，# 提及任务)',
          style: {
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: 'inherit'
          }
        }}
        height={height}
      />
    </div>
  )
}

// 用于React Hook Form的包装组件，支持@任务关联
interface MarkdownEditorFieldProps {
  field: {
    value?: string
    onChange: (value?: string) => void
    name: string
  }
  fieldState: {
    error?: { message?: string }
  }
  label?: string
  placeholder?: string
  required?: boolean
  projectId?: string
  onMentionSelect?: (task: TaskMention) => void
  onUserMentionSelect?: (user: UserMention) => void
  userHighlightTags?: Record<string | number, string | string[]>
}

export function MarkdownEditorField({
  field,
  projectId,
  onMentionSelect,
  onUserMentionSelect,
  userHighlightTags
}: MarkdownEditorFieldProps) {
  const { t } = useTranslation()
  const [showMentionPopup, setShowMentionPopup] = useState(false)
  const [mentionType, setMentionType] = useState<'task' | 'user' | null>(null)
  const [mentionStartPos, setMentionStartPos] = useState(-1)
  const [mentionSearchQuery, setMentionSearchQuery] = useState('')
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({ x: 0, y: 0 })
  const editorRef = useRef<HTMLDivElement>(null)
  
  // 获取当前项目ID
  const currentProjectId = useMemo(() => {
    return projectId || localStorage.getItem('selected_project_id')
  }, [projectId])
  
  // 处理@任务选择
  const handleMentionSelect = useCallback((task: TaskMention) => {
    const textarea = editorRef.current?.querySelector('textarea')
    if (!textarea || mentionStartPos === -1) return

    // 构建插入的文本
    const linkText = `[${task.title}](${task.url})`
    
    // 计算替换范围
    const currentValue = field.value || ''
    const beforeMention = currentValue.substring(0, mentionStartPos)
    const afterMention = currentValue.substring(mentionStartPos + mentionSearchQuery.length + 1) // +1 for #
    
    // 构建新的文本
    const newValue = beforeMention + linkText + afterMention
    
    // 更新值
    field.onChange(newValue)
    
    // 隐藏弹窗
    setShowMentionPopup(false)
    setMentionStartPos(-1)
    setMentionSearchQuery('')
    setMentionType(null)
    
    // 调用回调
    if (onMentionSelect) {
      onMentionSelect(task)
    } else {
      toast.success(t('tasks.detail.comments.toast.insertedTask', { title: task.title }))
    }
  }, [field, mentionStartPos, mentionSearchQuery, onMentionSelect])

  // 处理@用户选择
  const handleUserMentionSelect = useCallback((user: UserMention) => {
    const textarea = editorRef.current?.querySelector('textarea')
    if (!textarea || mentionStartPos === -1) return

    // 构建插入的文本 - 根据需求使用 "@用户名 " 格式
    const linkText = `@${user.name}`
    
    // 计算替换范围
    const currentValue = field.value || ''
    const beforeMention = currentValue.substring(0, mentionStartPos)
    const afterMention = currentValue.substring(mentionStartPos + mentionSearchQuery.length + 1) // +1 for @
    
    // 构建新的文本
    const newValue = beforeMention + linkText + ' ' + afterMention // Add a space after mention
    
    // 更新值
    field.onChange(newValue)
    
    // 隐藏弹窗
    setShowMentionPopup(false)
    setMentionStartPos(-1)
    setMentionSearchQuery('')
    setMentionType(null)
    
    // 调用回调
    if (onUserMentionSelect) {
      onUserMentionSelect(user)
    } else {
      // toast.success(`已提及用户: ${user.name}`)
    }
  }, [field, mentionStartPos, mentionSearchQuery, onUserMentionSelect])

  // 监听MDEditor内部textarea的变化
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
  
    let textarea: HTMLTextAreaElement | null = editor.querySelector('textarea')
    const bind = (ta: HTMLTextAreaElement) => {
      const handleInput = (event: Event) => {
        const target = event.target as HTMLTextAreaElement
        const value = target.value
        const cursorPos = target.selectionStart
        const beforeCursor = value.substring(0, cursorPos)
        
        // 检查 @ (用户提及)
        const atIndex = beforeCursor.lastIndexOf('@')
        // 检查 # (任务提及)
        const hashIndex = beforeCursor.lastIndexOf('#')
        
        // 确定哪个触发符离光标最近
        let triggerIndex = -1
        let type: 'user' | 'task' | null = null
        
        if (atIndex > hashIndex) {
          triggerIndex = atIndex
          type = 'user'
        } else if (hashIndex > atIndex) {
          triggerIndex = hashIndex
          type = 'task'
        }
        
        if (triggerIndex !== -1) {
          const afterTrigger = beforeCursor.substring(triggerIndex + 1)
          // 确保触发符前是空格或者行首，且触发符后是有效字符
          const charBefore = triggerIndex > 0 ? beforeCursor[triggerIndex - 1] : ' '
          
          // 根据类型选择正则：用户提及不允许空格（避免选中后重新触发），任务提及允许空格
          const regex = type === 'user' 
            ? /^[\w\u4e00-\u9fa5-]*$/ 
            : /^[\w\u4e00-\u9fa5\s-]*$/

          if ((charBefore === ' ' || charBefore === '\n') && 
              regex.test(afterTrigger) && 
              !afterTrigger.includes('\n')) {
            
            setMentionStartPos(triggerIndex)
            setMentionSearchQuery(afterTrigger)
            setMentionType(type)
            
            const rect = ta.getBoundingClientRect()
            const containerRect = editor.getBoundingClientRect()
            
            // 简单的位置计算，实际可能需要更复杂的光标位置计算库
            // 这里只是让弹窗显示在输入框附近
            setPopupPosition({
              x: 20, // 暂时固定左侧位置或根据需要调整
              y: rect.top - containerRect.top + 40 // 显示在输入框下方一点
            })
            setShowMentionPopup(true)
            return
          }
        }
        
        setShowMentionPopup(false)
        setMentionStartPos(-1)
        setMentionSearchQuery('')
        setMentionType(null)
      }
      const handlePaste = async (event: ClipboardEvent) => {
        const clipboard = event.clipboardData
        if (!clipboard) return
        const items = clipboard.items
        const imageFiles: File[] = []
        let pastedText = clipboard.getData('text/plain') || ''
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item && item.type && item.type.startsWith('image/')) {
            const file = item.getAsFile()
          if (file) {
            if (file.size > 10 * 1024 * 1024) {
              toast.error(t('tasks.detail.comments.toast.imageTooLarge'))
              continue
            }
            imageFiles.push(file)
          }
        }
        }
        if (imageFiles.length === 0) {
          return
        }
        // 阻止默认粘贴，避免将图片转为 Base64 导致卡顿
        event.preventDefault()
        const currentValue = ta.value || ''
        // 不移除任何已选中的文本，始终在光标处插入
        const caretPos = ta.selectionEnd
        const before = currentValue.substring(0, caretPos)
        const after = currentValue.substring(caretPos)
        const uploadMarker = `<!--uploading-images:${Date.now()}-${Math.random().toString(36).slice(2,8)}-->`
        const insertContent = [
          pastedText.trim(),
          uploadMarker
        ].filter(Boolean).join('\n')
        const newValueInitial = `${before}${insertContent}${after}`
        field.onChange(newValueInitial)
        try {
          const resp = await apiClient.uploadBatch(imageFiles, 'task', { onUploadProgress: undefined })
          if (resp.code === 200 && Array.isArray(resp.data)) {
            const uploadedList = resp.data as UploadedFileData[]
            const imagesMarkdown = uploadedList
              .map((uploaded, idx) => `![Image ${idx + 1}](${uploaded.url})`)
              .join('\n')
            const latest = ta.value || field.value || newValueInitial
            const replacedValue = latest.replace(uploadMarker, imagesMarkdown)
            field.onChange(replacedValue)
            toast.success(t('tasks.detail.comments.toast.insertImages', { count: uploadedList.length }))
          } else {
            const latest = ta.value || field.value || newValueInitial
            const cleanedValue = latest.replace(uploadMarker, '')
            field.onChange(cleanedValue)
            toast.error(resp.msg || t('tasks.detail.comments.toast.uploadFailed'))
          }
        } catch {
          const latest = ta.value || field.value || newValueInitial
          const cleanedValue = latest.replace(uploadMarker, '')
          field.onChange(cleanedValue)
          toast.error(t('tasks.detail.comments.toast.uploadFailedRetry'))
        }
      }
      ta.addEventListener('input', handleInput)
      ta.addEventListener('keyup', handleInput)
      ta.addEventListener('paste', handlePaste as any)
      ta.addEventListener('click', handleInput) // 点击时也检查光标位置
      
      return () => {
        ta.removeEventListener('input', handleInput)
        ta.removeEventListener('keyup', handleInput)
        ta.removeEventListener('paste', handlePaste as any)
        ta.removeEventListener('click', handleInput)
      }
    }
  
    let cleanup: (() => void) | null = null
    if (textarea) {
      cleanup = bind(textarea)
    } else {
      const observer = new MutationObserver(() => {
        const ta = editor.querySelector('textarea')
        if (ta) {
          textarea = ta as HTMLTextAreaElement
          cleanup = bind(textarea)
          observer.disconnect()
        }
      })
      observer.observe(editor, { childList: true, subtree: true })
      cleanup = () => observer.disconnect()
    }
  
    return () => {
      if (cleanup) cleanup()
    }
  }, [])

  return (
    <div ref={editorRef} className="relative">
      <MarkdownEditor
        value={field.value || ''}
        onChange={field.onChange}
        placeholder={`${t('tasks.detail.comments.form.placeholder')} (${t('tasks.detail.comments.form.tips')})`}
      />
      
      {showMentionPopup && currentProjectId && (
        <>
          {mentionType === 'task' && (
            <TaskMentionPopup
              isOpen={showMentionPopup}
              searchQuery={mentionSearchQuery}
              onSelect={handleMentionSelect}
              onClose={() => setShowMentionPopup(false)}
              onSearchChange={setMentionSearchQuery}
              position={popupPosition}
              projectId={currentProjectId}
            />
          )}
          {mentionType === 'user' && (
            <UserMentionPopup
              isOpen={showMentionPopup}
              searchQuery={mentionSearchQuery}
              onSelect={handleUserMentionSelect}
              onClose={() => setShowMentionPopup(false)}
              onSearchChange={setMentionSearchQuery}
              position={popupPosition}
              projectId={currentProjectId}
              highlightTags={userHighlightTags}
            />
          )}
        </>
      )}
    </div>
  )
}
