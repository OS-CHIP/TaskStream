import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  File, 
  Download, 
  Trash2, 
  Eye,
  FileText,
  Image,
  FileVideo,
  FileAudio,
  Archive
} from 'lucide-react'
import type { TaskDetail } from '../data/schema'
import { useTranslation } from 'react-i18next'

interface TaskAttachmentsProps {
  task: TaskDetail
  onDeleteAttachment?: (attachmentId: string) => void
  onDownloadAttachment?: (attachmentId: string) => void
  onPreviewAttachment?: (attachmentId: string) => void
  className?: string
  readOnly?: boolean // 新增：控制是否为只读模式，只读模式下不显示删除按钮
}

interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return Image
  if (type.startsWith('video/')) return FileVideo
  if (type.startsWith('audio/')) return FileAudio
  if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return Archive
  if (type.includes('pdf') || type.includes('doc') || type.includes('txt')) return FileText
  return File
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}


export function TaskAttachments({
  task,
  onDeleteAttachment,
  onDownloadAttachment,
  onPreviewAttachment,
  className,
  readOnly = false // 默认为false，即默认显示删除按钮
}: TaskAttachmentsProps) {
  const { t, i18n } = useTranslation()
  
  // 模拟附件数据
  const attachments: Attachment[] = task.attachments?.map(att => ({
    id: att.id,
    name: att.name,
    size: att.size,
    type: att.type,
    url: att.url,
    uploadedAt: att.uploadedAt.toISOString(),
    uploadedBy: att.uploadedBy
  })) || []



  const handleDelete = (attachment: Attachment) => {
    if (window.confirm(t('tasks.attachments.deleteConfirm'))) {
      onDeleteAttachment?.(attachment.id)
    }
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div className="flex items-center gap-2">
        <File className="h-5 w-5" />
        <h3 className="text-lg font-semibold">{t('tasks.detail.attachments.title', { count: attachments.length })}</h3>
      </div>


        {/* 附件列表 */}
        {attachments.length > 0 && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              {attachments.map((attachment) => {
                const FileIcon = getFileIcon(attachment.type)
                const isImage = attachment.type.startsWith('image/')
                
                return (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <FileIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate">
                          {attachment.name}
                        </p>
                        {isImage && (
                          <Badge variant="secondary" className="text-xs">
                            {t('tasks.detail.attachments.imageBadge')}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span>•</span>
                        <span>{new Date(attachment.uploadedAt).toLocaleDateString(i18n.language === 'zh' ? 'zh-CN' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {isImage && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onPreviewAttachment?.(attachment.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownloadAttachment?.(attachment.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attachment)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {attachments.length === 0 && (
          <div className="text-center py-8">
            <File className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {t('tasks.detail.attachments.empty')}
            </p>
          </div>
        )}
    </div>
  )
}
