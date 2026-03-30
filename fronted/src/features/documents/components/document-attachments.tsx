import { useTranslation } from 'react-i18next'
import { FileText, Download, Image, FileArchive, File } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Document } from '../types/document'
// cn工具函数暂未使用，移除导入

interface DocumentAttachmentsProps {
  document: Document
}

// 根据文件扩展名获取对应图标
function getFileIcon(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return Image
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'txt':
    case 'md':
      return FileText
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
      return FileArchive
    default:
      return File
  }
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function DocumentAttachments({ document: doc }: DocumentAttachmentsProps) {
  const { t } = useTranslation()
  const download = async (name: string, url?: string) => {
    if (!url) return
    try {
      const resp = await fetch(url)
      const blob = await resp.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = objectUrl
      link.download = name
      window.document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(objectUrl)
    } catch {
      const link = window.document.createElement('a')
      link.href = url
      link.download = name
      window.document.body.appendChild(link)
      link.click()
      link.remove()
    }
  }

  if (!doc.attachments || doc.attachments.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
        {t('documents.view.attachments', '附件')}
        </h3>
        <div className="text-center text-muted-foreground">
          <p>{t('documents.view.noAttachments', '暂无附件')}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {t('documents.view.attachments', '附件')} ({doc.attachments.length})
      </h3>
      
      <div className="space-y-3">
        {doc.attachments.map((attachment, index) => {
          const IconComponent = getFileIcon(attachment.name)
          
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div
                className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                onClick={() => { void download(attachment.name, attachment.url) }}
              >
                <div className="flex-shrink-0">
                  <IconComponent className="h-8 w-8 text-muted-foreground" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-blue-600 hover:underline">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 ml-2"
                onClick={() => { void download(attachment.name, attachment.url) }}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">
                  {t('documents.view.downloadAttachment', '下载附件')}
                </span>
              </Button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
