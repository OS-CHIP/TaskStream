import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface RefreshCountdownDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  countdownSeconds?: number
  onRefresh?: () => void
}

export function RefreshCountdownDialog({
  open,
  onOpenChange,
  title = '创建成功',
  description = '项目创建成功！页面将自动刷新',
  countdownSeconds = 3,
  onRefresh,
}: RefreshCountdownDialogProps) {
  const [countdown, setCountdown] = useState(countdownSeconds)

  useEffect(() => {
    if (!open) {
      setCountdown(countdownSeconds)
      return
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 倒计时结束，执行刷新
          clearInterval(timer)
          onOpenChange(false)
          if (onRefresh) {
            onRefresh()
          } else {
            window.location.reload()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, countdownSeconds, onOpenChange, onRefresh])

  const handleRefreshNow = () => {
    onOpenChange(false)
    if (onRefresh) {
      onRefresh()
    } else {
      window.location.reload()
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-left">{title}</DialogTitle>
              <DialogDescription className="text-left">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{countdown}</div>
            <div className="text-sm text-muted-foreground">秒后自动刷新</div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button onClick={handleRefreshNow}>
              立即刷新
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}