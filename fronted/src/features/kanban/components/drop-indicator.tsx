import { cn } from '@/lib/utils'

interface DropIndicatorProps {
  isVisible: boolean
  position: 'top' | 'bottom'
  className?: string
}

/**
 * 拖拽插入指示器组件
 * 显示卡片插入位置的视觉提示
 */
export function DropIndicator({ isVisible, position }: DropIndicatorProps) {
  return (
    <div className={cn(
      'absolute left-0 right-0 flex items-center justify-center z-10',
      'transition-all duration-500 ease-out',
      position === 'top' ? '-top-2' : '-bottom-2',
      isVisible 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-90 pointer-events-none',
      position === 'top' && !isVisible && '-translate-y-2',
      position === 'bottom' && !isVisible && 'translate-y-2'
    )}>
      {/* 主指示线 */}
      <div className={cn(
        'flex-1 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent relative',
        'transition-all duration-500 ease-out',
        isVisible ? 'scale-x-100' : 'scale-x-0'
      )}>
        {/* 发光效果 */}
        <div className={cn(
          'absolute inset-0 bg-primary/50 blur-sm',
          'transition-opacity duration-300 delay-100',
          isVisible ? 'opacity-100' : 'opacity-0'
        )} />
        
        {/* 左侧圆点 */}
        <div className={cn(
          'absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-lg',
          'transition-all duration-400 delay-200 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}>
          <div className="absolute inset-0 bg-primary/70 rounded-full animate-pulse" />
        </div>
        
        {/* 右侧圆点 */}
        <div className={cn(
          'absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full shadow-lg',
          'transition-all duration-400 delay-200 ease-out',
          isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        )}>
          <div className="absolute inset-0 bg-primary/70 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}

/**
 * 插入区域组件
 * 包装卡片并提供插入指示器
 */
interface DropZoneProps {
  children: React.ReactNode
  isOver?: boolean
  insertPosition?: 'top' | 'bottom' | null
  className?: string
}

export function DropZone({ children, isOver = false, insertPosition, className }: DropZoneProps) {
  return (
    <div className={cn('relative', className)}>
      {/* 顶部插入指示器 */}
      {isOver && insertPosition === 'top' && (
        <DropIndicator isVisible={true} position="top" />
      )}
      
      {/* 卡片内容 - 添加让位动画 */}
      <div className={cn(
        'transition-all duration-300 ease-in-out',
        // 顶部插入时，卡片向下移动
        isOver && insertPosition === 'top' && 'transform translate-y-3 scale-[0.98]',
        // 底部插入时，卡片向上移动
        isOver && insertPosition === 'bottom' && 'transform -translate-y-3 scale-[0.98]',
        // 添加阴影效果增强视觉反馈
        isOver && 'shadow-lg'
      )}>
        {children}
      </div>
      
      {/* 底部插入指示器 */}
      {isOver && insertPosition === 'bottom' && (
        <DropIndicator isVisible={true} position="bottom" />
      )}
    </div>
  )
}