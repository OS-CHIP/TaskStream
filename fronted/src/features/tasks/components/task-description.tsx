import { useEffect, useRef, useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { ImagePreviewModal } from '@/components/image-preview-modal'
import type { TaskDetail } from '../data/schema'

interface TaskDescriptionProps {
  task: TaskDetail
}

export function TaskDescription({ 
  task
}: TaskDescriptionProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewImageUrl, setPreviewImageUrl] = useState('')
  const [previewAlt, setPreviewAlt] = useState('Preview')

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName.toLowerCase() === 'img') {
        const img = target as HTMLImageElement
        setPreviewImageUrl(img.src)
        setPreviewAlt(img.alt || 'Preview')
        setIsPreviewOpen(true)
      }
    }
    const el = contentRef.current
    if (el) {
      el.addEventListener('click', handleClick)
      const images = el.querySelectorAll('img')
      images.forEach(img => {
        img.classList.add('cursor-zoom-in', 'hover:opacity-90', 'transition-opacity')
      })
    }
    return () => {
      if (el) {
        el.removeEventListener('click', handleClick)
      }
    }
  }, [task.description])

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">任务描述</h3>
        </div>

        <div className="min-h-[200px]">
          <div className="border rounded-lg bg-white min-h-[160px] max-h-[480px] overflow-y-auto">
            <div className="p-4">
            {task.description ? (
              <div ref={contentRef} className="prose prose-sm max-w-none" data-color-mode="light">
                {(() => {
                  const components = {
                    img: (props: any) => (
                      <img {...props} referrerPolicy="no-referrer" crossOrigin="anonymous" />
                    ),
                  }
                  return (
                    <MDEditor.Markdown
                      source={task.description}
                      style={{ backgroundColor: 'transparent', color: 'inherit' }}
                      components={components}
                    />
                  )
                })()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-gray-500 mb-2">暂无任务描述</p>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
        <ImagePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          imageUrl={previewImageUrl}
          alt={previewAlt}
        />
    </div>
  )
}
