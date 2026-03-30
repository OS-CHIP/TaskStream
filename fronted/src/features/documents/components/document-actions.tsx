import { useTranslation } from 'react-i18next'
import { ArrowLeft, Share } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'
import { Document } from '../types/document'
import { toast } from 'sonner'

interface DocumentActionsProps {
  document: Document
}

export function DocumentActions({ document }: DocumentActionsProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  void document

  const handleBack = () => {
    navigate({ to: '/documents' })
  }

  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t('documents.view.shareCopied', { defaultValue: '链接已复制到剪贴板' }))
    } catch {
      try {
        const textarea = window.document.createElement('textarea')
        textarea.value = url
        textarea.style.position = 'fixed'
        textarea.style.left = '-1000px'
        window.document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const ok = window.document.execCommand('copy')
        window.document.body.removeChild(textarea)
        if (ok) {
          toast.success(t('documents.view.shareCopied', { defaultValue: '链接已复制到剪贴板' }))
        } else {
          toast.error(t('documents.view.shareFailed', { defaultValue: '复制失败，请手动复制' }))
        }
      } catch {
        toast.error(t('documents.view.shareFailed', { defaultValue: '复制失败，请手动复制' }))
      }
    }
  }

  

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-background border-border hover:bg-muted"
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">{t('common.back')}</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg bg-background border-border hover:bg-muted"
          onClick={handleShare}
        >
          <Share className="h-5 w-5" />
          <span className="sr-only">{t('documents.view.share', '分享')}</span>
        </Button>
      </div>
    </div>
  )
}
