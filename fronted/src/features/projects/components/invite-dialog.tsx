import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { LoadingState } from '@/components/ui/loading-state'
import type { InviteMethod } from '../types'
import { useProjectRoles } from '@/hooks/useProjectRoles'
import { useTranslation } from 'react-i18next'
import { showError, showSuccess } from '@/utils/error-handler'
import { projectsService } from '../services/projects.service'
import '@/features/projects/i18n/register'

export function InviteDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string | null
  onInviteSuccess?: () => void
}) {
  const { open, onOpenChange, projectId, onInviteSuccess } = props
  const [method, setMethod] = useState<InviteMethod>('username')
  const [target, setTarget] = useState('')
  const [role, setRole] = useState<string>('') // 改为string类型，存储roleId
  const [error, setError] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)
  const { t } = useTranslation()

  // 使用useProjectRoles Hook获取角色数据
  const {
    roleOptions,
    isLoading: rolesLoading,
    isError: rolesError,
    error: rolesErrorMessage,
    isEmpty: rolesEmpty,
    canRetry,
    retry: retryRoles,
    clearError: clearRolesError
  } = useProjectRoles(projectId || null, {
    enableCache: true,
    autoFetch: true,
    showErrorToast: false // 在组件内部处理错误显示
  })

  // 增强的表单验证函数
  const validateForm = () => {
    const trimmedTarget = target.trim()
    
    // 必填字段验证
    if (!trimmedTarget) {
      return t('projects.invite.targetRequired')
    }
    
    // 邮箱格式验证（更严格的正则表达式）
    if (method === 'email') {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!emailRegex.test(trimmedTarget)) {
        return t('projects.invite.validation.emailInvalid')
      }
    }
    
    // 用户名验证（字母数字下划线，3-50字符）
    if (method === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/
      if (!usernameRegex.test(trimmedTarget)) {
        return t('projects.invite.validation.usernameInvalid', { defaultValue: '用户名只能包含字母、数字和下划线，长度3-50字符' })
      }
    }
    
    // 角色验证
    if (!role) {
      return t('projects.invite.validation.roleRequired')
    }
    
    // 项目ID验证
    if (!projectId) {
      return '项目ID不能为空'
    }
    
    return null
  }

  const handleSubmit = async () => {
    // 防重复提交
    if (isInviting) {
      return
    }
    
    setError(null)
    
    // 表单验证
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsInviting(true)
    try {
      // 调用API邀请用户
      await projectsService.inviteUser({
        id: projectId!,
        userNameOrEmail: target.trim(),
        roleId: role
      })
      
      // 显示成功提示
      showSuccess(t('projects.invite.success', { email: target.trim() }))
      
      // 重置表单并关闭对话框
      resetForm()
      onOpenChange(false)
      
      // 调用成功回调
      onInviteSuccess?.()
    } catch (error) {
      showError(error, {
        id: 'invite-submit-error'
      })
    } finally {
      setIsInviting(false)
    }
  }

  // 重置表单状态
  const resetForm = () => {
    setTarget('')
    setMethod('username')
    setRole('')
    setError(null)
    clearRolesError()
  }

  // 当对话框关闭时重置表单
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{t('projects.invite.title')}</DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {/* 角色加载错误提示 */}
          {rolesError && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription className='flex items-center justify-between'>
                <span>{rolesErrorMessage || t('projects.invite.loadRolesFailed')}</span>
                {canRetry && (
                  <Button 
                    variant='outline' 
                    size='sm' 
                    onClick={retryRoles}
                    className='ml-2'
                  >
                    <RefreshCw className='h-3 w-3 mr-1' />
                    重试
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div className='space-y-1.5'>
              <div className='text-sm text-muted-foreground'>{t('projects.form.visibility')}</div>
              <Select value={method} onValueChange={(v) => setMethod(v as InviteMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='email'>{t('projects.invite.method.email')}</SelectItem>
                  <SelectItem value='username'>{t('projects.invite.method.username')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1.5'>
              <div className='text-sm text-muted-foreground'>
                {t('projects.invite.role.admin')}
                {rolesLoading && <Loader2 className='inline ml-1 h-3 w-3 animate-spin' />}
              </div>
              {rolesLoading ? (
                <LoadingState
                  type="loading"
                  message={t('projects.roles.loading')}
                  size="sm"
                  className="py-4"
                />
              ) : rolesError ? (
                <LoadingState
                  type="error"
                  message={rolesErrorMessage || t('projects.invite.loadRolesFailed')}
                  onRetry={retryRoles}
                  size="sm"
                  className="py-4"
                />
              ) : rolesEmpty ? (
                <LoadingState
                  type="empty"
                  message={t('projects.roles.noRoles')}
                  size="sm"
                  className="py-4"
                />
              ) : (
                <Select 
                  value={role} 
                  onValueChange={setRole}
                  disabled={rolesLoading || isInviting}
                >
                  <SelectTrigger>
                  <SelectValue placeholder={t('projects.invite.selectRole')} />
                </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className='space-y-1.5'>
            <div className='text-sm text-muted-foreground'>
              {method === 'email' ? t('projects.invite.email') : t('projects.invite.username')}
            </div>
            <Input
              value={target}
              onChange={(e) => {
                setTarget(e.target.value)
                // 清除错误信息以提供实时反馈
                if (error) {
                  setError(null)
                }
              }}
              onBlur={() => {
                // 失焦时进行实时验证
                const validationError = validateForm()
                if (validationError) {
                  setError(validationError)
                }
              }}
              placeholder={method === 'email' ? 'name@example.com' : t('projects.invite.username')}
              disabled={isInviting}
            />
            {error ? <div className='text-xs text-destructive'>{error}</div> : null}
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={isInviting}>
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isInviting || rolesLoading || (rolesError && !roleOptions.length)}
            >
              {isInviting ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {t('projects.invite.sending')}
                </>
              ) : (
                t('projects.invite.send')
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}