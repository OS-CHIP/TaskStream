import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Project } from '../types'
import '@/features/projects/i18n/register'

interface DeleteProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project: Project | null
  onConfirm: () => Promise<void>
  loading?: boolean
}

export function DeleteProjectDialog({
  open,
  onOpenChange,
  project,
  onConfirm,
  loading = false
}: DeleteProjectDialogProps) {
  const { t } = useTranslation()
  const [confirmText, setConfirmText] = useState('')
  const [isConfirmValid, setIsConfirmValid] = useState(false)

  const handleConfirmTextChange = (value: string) => {
    setConfirmText(value)
    setIsConfirmValid(value === project?.name)
  }

  const handleConfirm = async () => {
    if (!isConfirmValid || loading) return
    try {
      await onConfirm()
      setConfirmText('')
      setIsConfirmValid(false)
    } catch (_error) {
      // 错误处理由父组件处理
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!loading) {
      onOpenChange(newOpen)
      if (!newOpen) {
        setConfirmText('')
        setIsConfirmValid(false)
      }
    }
  }

  if (!project) return null

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">{t('projects.deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                {t('projects.deleteDialog.description')}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-sm text-red-800">
              <strong>{t('projects.deleteDialog.aboutToDelete')}</strong>
            </p>
            <p className="text-sm font-medium text-red-900 mt-1">
              {project.name}
            </p>
            {project.description && (
              <p className="text-xs text-red-700 mt-1">
                {project.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-text" className="text-sm font-medium">
              {t('projects.deleteDialog.confirmLabel')} <span className="text-red-500">"{project.name}"</span> 以确认删除：
            </Label>
            <Input
              id="confirm-text"
              value={confirmText}
              onChange={(e) => handleConfirmTextChange(e.target.value)}
              placeholder={t('projects.deleteDialog.confirmPlaceholder', { name: project.name })}
              disabled={loading}
              className={confirmText && !isConfirmValid ? 'border-red-300 focus:border-red-500' : ''}
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-red-600">
                {t('projects.deleteDialog.nameNotMatch')}
              </p>
            )}
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={loading}>
            {t('projects.deleteDialog.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isConfirmValid || loading}
              className="min-w-[80px]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('projects.deleteDialog.deleting')}
                </>
              ) : (
                t('projects.deleteDialog.confirm')
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}