import React from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

/**
 * 加载状态类型
 */
export type LoadingStateType = 'loading' | 'error' | 'empty' | 'success'

/**
 * 加载状态组件属性
 */
export interface LoadingStateProps {
  /** 状态类型 */
  type: LoadingStateType
  /** 自定义消息 */
  message?: string
  /** 自定义描述 */
  description?: string
  /** 重试回调 */
  onRetry?: () => void
  /** 自定义类名 */
  className?: string
  /** 是否显示图标 */
  showIcon?: boolean
  /** 大小 */
  size?: 'sm' | 'md' | 'lg'
  /** 错误对象（用于显示详细错误信息） */
  error?: Error
}

/**
 * 加载状态组件
 * 提供统一的加载、错误、空状态显示
 */
export function LoadingState({
  type,
  message,
  description,
  onRetry,
  className,
  showIcon = true,
  size = 'md',
  error
}: LoadingStateProps) {
  const { t } = useTranslation()

  // 根据类型获取默认配置
  const getConfig = () => {
    switch (type) {
      case 'loading':
        return {
          icon: <Loader2 className="animate-spin" />,
          message: message || t('common.loading', { defaultValue: '加载中...' }),
          description: description,
          showRetry: false
        }
      case 'error':
        return {
          icon: <AlertCircle className="text-destructive" />,
          message: message || error?.message || t('common.error.unknown', { defaultValue: '加载失败' }),
          description: description || t('common.error.network', { defaultValue: '请检查网络连接后重试' }),
          showRetry: true
        }
      case 'empty':
        return {
          icon: <div className="w-6 h-6 rounded-full bg-muted" />,
          message: message || t('common.noData', { defaultValue: '暂无数据' }),
          description: description,
          showRetry: false
        }
      case 'success':
        return {
          icon: <div className="w-6 h-6 rounded-full bg-green-500" />,
          message: message || t('common.success', { defaultValue: '操作成功' }),
          description: description,
          showRetry: false
        }
      default:
        return {
          icon: null,
          message: message || '',
          description: description,
          showRetry: false
        }
    }
  }

  const config = getConfig()

  // 根据大小获取样式
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-4',
          icon: 'w-4 h-4',
          message: 'text-sm',
          description: 'text-xs'
        }
      case 'lg':
        return {
          container: 'py-12',
          icon: 'w-8 h-8',
          message: 'text-lg',
          description: 'text-base'
        }
      default: // md
        return {
          container: 'py-8',
          icon: 'w-6 h-6',
          message: 'text-base',
          description: 'text-sm'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center space-y-3',
      sizeClasses.container,
      className
    )}>
      {/* 图标 */}
      {showIcon && config.icon && (
        <div className={cn('flex items-center justify-center', sizeClasses.icon)}>
          {React.cloneElement(config.icon, {
            className: cn(config.icon.props.className, sizeClasses.icon)
          })}
        </div>
      )}

      {/* 消息 */}
      {config.message && (
        <div className={cn('font-medium text-foreground', sizeClasses.message)}>
          {config.message}
        </div>
      )}

      {/* 描述 */}
      {config.description && (
        <div className={cn('text-muted-foreground max-w-sm', sizeClasses.description)}>
          {config.description}
        </div>
      )}

      {/* 重试按钮 */}
      {config.showRetry && onRetry && (
        <Button
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={onRetry}
          className="mt-4"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('common.retry', { defaultValue: '重试' })}
        </Button>
      )}
    </div>
  )
}

/**
 * 骨架屏组件
 */
export interface SkeletonProps {
  className?: string
  /** 行数 */
  lines?: number
  /** 是否显示头像 */
  avatar?: boolean
  /** 是否显示标题 */
  title?: boolean
}

export function Skeleton({ className, lines = 3, avatar = false, title = false }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <div className="flex space-x-4">
        {/* 头像骨架 */}
        {avatar && (
          <div className="rounded-full bg-muted h-10 w-10 flex-shrink-0" />
        )}
        
        <div className="flex-1 space-y-2">
          {/* 标题骨架 */}
          {title && (
            <div className="h-4 bg-muted rounded w-3/4" />
          )}
          
          {/* 内容骨架 */}
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-3 bg-muted rounded',
                index === lines - 1 ? 'w-1/2' : 'w-full'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * 列表骨架屏
 */
export interface ListSkeletonProps {
  /** 项目数量 */
  count?: number
  /** 是否显示头像 */
  avatar?: boolean
  /** 是否显示标题 */
  title?: boolean
  /** 每项的行数 */
  lines?: number
  className?: string
}

export function ListSkeleton({ 
  count = 3, 
  avatar = false, 
  title = true, 
  lines = 2, 
  className 
}: ListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          avatar={avatar}
          title={title}
          lines={lines}
        />
      ))}
    </div>
  )
}