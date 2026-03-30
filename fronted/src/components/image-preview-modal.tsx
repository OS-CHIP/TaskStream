import React from 'react'

interface ImagePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt?: string
}

export function ImagePreviewModal({ isOpen, onClose, imageUrl, alt = 'Preview' }: ImagePreviewModalProps) {
  const [scale, setScale] = React.useState(1)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const imageRef = React.useRef<HTMLImageElement>(null)

  // 缩放控制
  const ZOOM_STEP = 0.1
  const MIN_SCALE = 1
  const MAX_SCALE = 5

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + ZOOM_STEP, MAX_SCALE))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - ZOOM_STEP, MIN_SCALE))
    // 如果缩放到原始大小，重置位置
    if (scale - ZOOM_STEP <= MIN_SCALE) {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleReset = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // 滚轮缩放
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newScale = Math.min(Math.max(scale + delta, MIN_SCALE), MAX_SCALE)
    setScale(newScale)
  }

  // 拖拽功能
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-200 z-30"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
      
      {/* Zoom controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 rounded-full p-2 flex space-x-2 z-30">
        <button
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleZoomOut();
          }}
          className="bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 min-w-[40px] h-[40px] flex items-center justify-center"
          aria-label="Zoom out"
          disabled={scale <= MIN_SCALE}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-minus"><path d="M5 12h14"/></svg>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleReset();
          }}
          className="bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 min-w-[40px] h-[40px] flex items-center justify-center"
          aria-label="Reset zoom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation(); // 阻止事件冒泡
            handleZoomIn();
          }}
          className="bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-all duration-200 min-w-[40px] h-[40px] flex items-center justify-center"
          aria-label="Zoom in"
          disabled={scale >= MAX_SCALE}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </button>
      </div>
      
      {/* Image container */}
      <div 
        className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // 阻止点击容器关闭模态框
      >
        {/* Image wrapper for dragging */}
        <div
          className="relative"
          style={{
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={alt}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transform transition-transform duration-100"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              maxHeight: '90vh',
              maxWidth: '90vw'
            }}
            onWheel={handleWheel}
          />
        </div>
      </div>
    </div>
  )
}
