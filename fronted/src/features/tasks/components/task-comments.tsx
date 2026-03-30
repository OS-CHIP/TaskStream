import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { useState, useEffect, useMemo, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageSquare, 
  Send, 
  Reply, 
  Eye, 
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TaskDetail } from '../data/schema'
import { publishComment, getTaskCommentsTree } from '../services/task-detail-service'
import { TaskService } from '../services/task-service'
import { toast } from 'sonner'
import { MarkdownEditorField } from './markdown-editor'
import { ImagePreviewModal } from '@/components/image-preview-modal'
import type { TaskMention, UserMention } from '@/types/mention'
import { useTranslation } from 'react-i18next'

interface TaskCommentsProps {
  task: TaskDetail
  onAddComment?: (content: string, parentId?: string) => void
  className?: string
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: string
  updatedAt?: string
  parentId?: string
  replyToUser?: {
    id: string
    name: string
  }
  level: number
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    return diffInMinutes < 1 ? '刚刚' : `${diffInMinutes}分钟前`
  } else if (diffInHours < 24) {
    return `${diffInHours}小时前`
  } else if (diffInHours < 24 * 7) {
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
}

const getUserInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// 评论项组件
function CommentItem({ 
  comment, 
  onReply,
  onImageClick,
  roleLabels
}: { 
  comment: Comment
  onReply?: (content: string, parentId: string) => void
  onImageClick?: (url: string) => void
  level?: number
  roleLabels?: string[]
}) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName.toLowerCase() === 'img') {
        const img = target as HTMLImageElement
        onImageClick?.(img.src)
      }
    }

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.addEventListener('click', handleClick)
      // Add styles to images
      const images = contentElement.querySelectorAll('img')
      images.forEach(img => {
        img.classList.add('cursor-zoom-in', 'hover:opacity-90', 'transition-opacity')
      })
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('click', handleClick)
      }
    }
  }, [comment.content, onImageClick])

  return (
    <div className={cn('space-y-3', comment.level > 0 && 'ml-8 border-l-2 border-muted pl-4')}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {getUserInitials(comment.author.name)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium">{comment.author.name}</span>
            {Array.isArray(roleLabels) && roleLabels.map((label, idx) => (
              <Badge key={`${comment.author.id}-${idx}`} variant="outline" className="text-[10px] px-1 py-0.5">
                {label}
              </Badge>
            ))}
            {comment.replyToUser && comment.level >= 2 && (
              <>
                <span className="text-xs text-muted-foreground">回复</span>
                <span className="text-sm font-medium text-primary">@{comment.replyToUser.name}</span>
              </>
            )}
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
              <Badge variant="secondary" className="text-xs">
                已编辑
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div 
              ref={contentRef}
              className="text-sm prose prose-sm max-w-none"
              data-color-mode="light"
            >
              <MDEditor.Markdown
                source={comment.content}
                style={{ backgroundColor: 'transparent', color: 'inherit' }}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-7 px-2 text-xs"
              >
                <Reply className="h-3 w-3 mr-1" />
                回复
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* 回复表单 */}
      {showReplyForm && (
        <div className="ml-11">
          <CommentForm
            onSubmit={(content) => {
              onReply?.(content, comment.id)
              setShowReplyForm(false)
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder="回复评论..."
            submitText="回复"
          />
        </div>
      )}
    </div>
  )
}

// 评论表单组件
function CommentForm({
  onSubmit,
  onCancel,
  placeholder = '添加评论...',
  submitText = '发布评论',
  userHighlightTags
}: {
  onSubmit: (content: string) => void
  onCancel?: () => void
  placeholder?: string
  submitText?: string
  userHighlightTags?: Record<string | number, string | string[]>
}) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [activeTab, setActiveTab] = useState('write')

  // 获取当前项目ID
  const currentProjectId = useMemo(() => {
    return localStorage.getItem('selected_project_id')
  }, [])

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
      setActiveTab('write')
    }
  }

  const handleMentionSelect = (task: TaskMention) => {
    toast.success(t('tasks.detail.comments.toast.insertedTask', { title: task.title }))
  }

  const handleUserMentionSelect = (user: UserMention) => {
    toast.success(t('tasks.detail.comments.toast.mentionedUser', { name: user.name }))
  }

  return (
    <div className="w-full border border-border rounded-lg">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between p-3 pb-0">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="write" className="text-xs">
              <FileText className="h-3 w-3 mr-1" />
              {t('tasks.detail.comments.form.write')}
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              {t('tasks.detail.comments.form.preview')}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="write" className="mt-0">
          <div className="p-3 pt-0">
            <MarkdownEditorField
              field={{
                value: content,
                onChange: (value?: string) => setContent(value || ''),
                name: 'comment'
              }}
              fieldState={{}}
              placeholder={placeholder || t('tasks.detail.comments.form.placeholder')}
              projectId={currentProjectId || undefined}
              onMentionSelect={handleMentionSelect}
              onUserMentionSelect={handleUserMentionSelect}
              userHighlightTags={userHighlightTags}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="mt-0">
          <div className="p-3 min-h-[120px] border-t">
            {content.trim() ? (
              <div 
                className="prose prose-sm max-w-none"
                data-color-mode="light"
              >
                <MDEditor.Markdown
                  source={content}
                  style={{ backgroundColor: 'transparent', color: 'inherit' }}
                />
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t('tasks.detail.comments.form.previewEmpty')}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center p-3 pt-0">
        <p className="text-xs text-muted-foreground">
          {t('tasks.detail.comments.form.tips')}
        </p>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" size="sm" onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!content.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {submitText || t('tasks.detail.comments.form.submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export function TaskComments({
  task,
  onAddComment,
  className
}: TaskCommentsProps) {
  const { t } = useTranslation()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userMapping, setUserMapping] = useState<Map<number, string>>(new Map())
  const [userMappingLoaded, setUserMappingLoaded] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')

  // 获取当前项目ID
  const currentProjectId = useMemo(() => {
    return localStorage.getItem('selected_project_id')
  }, [])

  // 独立的项目用户列表获取逻辑
  const fetchProjectUsers = async (projectId: string) => {
    try {
      console.log('开始获取项目用户列表，项目ID:', projectId)
      const users = await TaskService.getProjectUsers(projectId)
      console.log('获取到的用户数据:', users)
      
      const mapping = new Map<number, string>()
      if (users && Array.isArray(users)) {
        users.forEach((user: { label: string; value: number }) => {
          console.log(`添加用户映射: ${user.value} -> ${user.label}`)
          mapping.set(user.value, user.label)
        })
      }
      console.log('最终用户映射:', mapping)
      setUserMapping(mapping)
      setUserMappingLoaded(true)
    } catch (error) {
      console.error('获取项目用户失败:', error)
      // 如果获取用户失败，设置空映射，不影响评论功能
      setUserMapping(new Map())
      setUserMappingLoaded(true)
    }
  }

  // 只在项目ID变化时获取项目用户列表
  useEffect(() => {
    if (currentProjectId) {
      setUserMappingLoaded(false)
      fetchProjectUsers(currentProjectId)
    }
  }, [currentProjectId])

  // 将API返回的评论树数据转换为扁平化的评论列表
  const transformApiCommentsTree = (apiComments: any[], userMapping: Map<number, string>): Comment[] => {
    const flatComments: Comment[] = []
    const commentMap = new Map<string, any>()
    
    // 首先建立评论ID到评论对象的映射
    const buildCommentMap = (comments: any[]) => {
      comments.forEach(comment => {
        commentMap.set(comment.id.toString(), comment)
        if (comment.children && comment.children.length > 0) {
          buildCommentMap(comment.children)
        }
      })
    }
    
    buildCommentMap(apiComments)
    
    // 递归函数来扁平化评论树
    const flattenComments = (comments: any[], level: number = 0) => {
      comments.forEach(comment => {
        // 确保 createBy 是数字类型
        const createById = typeof comment.createBy === 'string' ? parseInt(comment.createBy) : comment.createBy
        console.log(`处理评论 ${comment.id}，createBy: ${createById} (类型: ${typeof createById})`)
        
        const authorName = userMapping.get(createById) || '未知用户'
        console.log(`用户映射结果: ${createById} -> ${authorName}`)
        
        // 获取被回复用户的信息
        let replyToUser = undefined
        if (level > 0 && comment.parentId) {
          const parentComment = commentMap.get(comment.parentId.toString())
          if (parentComment) {
            const parentCreateById = typeof parentComment.createBy === 'string' ? parseInt(parentComment.createBy) : parentComment.createBy
            const parentAuthorName = userMapping.get(parentCreateById) || '未知用户'
            replyToUser = {
              id: parentCreateById.toString(),
              name: parentAuthorName
            }
          }
        }
        
        const flatComment: Comment = {
          id: comment.id.toString(),
          content: comment.content,
          author: {
            id: createById.toString(),
            name: authorName,
          },
          createdAt: comment.createTime,
          parentId: comment.parentId ? comment.parentId.toString() : undefined,
          level: level,
          replyToUser: replyToUser
        }
        
        flatComments.push(flatComment)
        
        // 递归处理子评论
        if (comment.children && comment.children.length > 0) {
          flattenComments(comment.children, level + 1)
        }
      })
    }
    
    flattenComments(apiComments)
    return flatComments
  }

  // 获取评论列表
  const fetchComments = async (isRefresh = false) => {
    if (!task?.id) return
    
    try {
      // 如果是初始加载，显示loading状态；如果是刷新，显示refreshing状态
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      console.log('开始获取评论列表，任务ID:', task.id)
      // 只获取评论树数据
      const commentsResponse = await getTaskCommentsTree(task.id)
      console.log('获取到的评论数据:', commentsResponse)
      
      // 使用已缓存的用户映射来转换评论树数据
      const transformedComments = transformApiCommentsTree(commentsResponse, userMapping)
      console.log('转换后的评论数据:', transformedComments)
      setComments(transformedComments)
    } catch (error) {
      console.error('获取评论列表失败:', error)
      setError(t('tasks.detail.comments.toast.publishFailed'))
      // 如果是初始加载失败，使用任务中的评论数据作为后备
      // 如果是刷新失败，保持现有数据不变
      if (!isRefresh) {
        const fallbackComments: Comment[] = task.comments?.map(comment => ({
          id: comment.id,
          content: comment.content,
          author: typeof comment.author === 'string' 
            ? { id: comment.author, name: comment.author }
            : comment.author,
          createdAt: comment.createdAt.toISOString(),
          updatedAt: comment.updatedAt?.toISOString(),
          parentId: comment.parentId,
          level: 0,
          replyToUser: undefined
        })) || []
        setComments(fallbackComments)
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  // 当用户映射加载完成后，获取评论列表
  useEffect(() => {
    if (userMappingLoaded && task?.id) {
      console.log('用户映射已加载，开始获取评论列表')
      fetchComments()
    }
  }, [userMappingLoaded, task?.id])

  // 当用户映射更新时，重新转换已有的评论数据
  useEffect(() => {
    if (userMapping.size > 0 && comments.length > 0) {
      console.log('用户映射已更新，重新转换评论数据')
      // 这里需要重新获取原始评论数据并转换，但为了避免重复请求，
      // 我们在 fetchComments 中已经处理了这个逻辑
    }
  }, [userMapping])

  const handleAddComment = async (content: string, parentId?: string) => {
    try {
      // 调用真实的API发布评论
      const response = await publishComment({
        taskId: task.id,
        content,
        parentId
      })
      
      if (response.code === 200) {
        toast.success(t('tasks.detail.comments.toast.publishSuccess'))
        // 重新获取评论列表以显示最新的评论结构
        await fetchComments()
        // 调用父组件的回调函数
        onAddComment?.(content, parentId)
      } else {
        toast.error(response.msg || t('tasks.detail.comments.toast.publishFailed'))
      }
    } catch (error) {
      console.error('发布评论失败:', error)
      toast.error(t('tasks.detail.comments.toast.publishFailed'))
    }
  }



  const handleReply = async (content: string, parentId: string) => {
    try {
      const response = await publishComment({
        taskId: task.id,
        content,
        parentId
      })
      
      if (response.code === 200) {
        toast.success(t('tasks.detail.comments.toast.replySuccess'))
        // 刷新评论列表
        await fetchComments()
        // 调用父组件的回调函数
        onAddComment?.(content, parentId)
      } else {
        toast.error(response.msg || t('tasks.detail.comments.toast.replyFailed'))
      }
    } catch (error) {
      console.error('发布回复失败:', error)
      toast.error(t('tasks.detail.comments.toast.replyFailed'))
    }
  }

  const handleImageClick = (url: string) => {
    setPreviewImageUrl(url)
    setIsPreviewOpen(true)
  }

  const normalizeId = (value: any): number | undefined => {
    if (value == null) return undefined
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      const n = Number(value)
      return Number.isFinite(n) ? n : undefined
    }
    if (typeof value === 'object' && value.id != null) {
      const n = Number(value.id)
      return Number.isFinite(n) ? n : undefined
    }
    return undefined
  }

  const userHighlightTags: Record<string | number, string | string[]> = {}
  const assigneeId = normalizeId(task?.assignee)
  const assignerId = normalizeId(task?.assigner)
  if (assigneeId != null) {
    const existing = userHighlightTags[assigneeId]
    userHighlightTags[assigneeId] = Array.isArray(existing) ? [...existing, '负责人'] : existing ? [existing as string, '负责人'] : ['负责人']
  }
  if (assignerId != null) {
    const existing = userHighlightTags[assignerId]
    userHighlightTags[assignerId] = Array.isArray(existing) ? [...existing, '分配人'] : existing ? [existing as string, '分配人'] : ['分配人']
  }
  const getRoleLabelsForUser = (id: string): string[] => {
    const n = normalizeId(id)
    const labels: string[] = []
    if (n != null) {
      if (assigneeId === n) labels.push('负责人')
      if (assignerId === n) labels.push('分配人')
    }
    return labels
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('tasks.detail.comments.title', { count: comments.length })}</h3>
        {(loading || refreshing) && <Loader2 className="h-4 w-4 animate-spin" />}
      </div>
      
      {/* 添加评论表单 */}
      <CommentForm onSubmit={handleAddComment} userHighlightTags={userHighlightTags} />
      
      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => fetchComments(false)}
          >
            {t('common.retry')}
          </Button>
        </div>
      )}
      
      {/* 评论列表 */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 mx-auto mb-3 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('tasks.detail.comments.loading')}</p>
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          <Separator />
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">{t('tasks.detail.comments.list')}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fetchComments(true)}
              disabled={refreshing}
              className="h-8 w-8 p-0"
              title={t('tasks.detail.comments.refreshTitle')}
            >
              <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            </Button>
          </div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onImageClick={handleImageClick}
              roleLabels={getRoleLabelsForUser(comment.author.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {t('tasks.detail.comments.empty')}
          </p>
        </div>
      )}

      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={previewImageUrl}
      />
    </div>
  )
}
