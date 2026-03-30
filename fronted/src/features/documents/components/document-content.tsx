import MDEditor from '@uiw/react-md-editor'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Document } from '../types/document'
import '@uiw/react-md-editor/markdown-editor.css'

interface DocumentContentProps {
  document: Document
}

export function DocumentContent({ document }: DocumentContentProps) {
  const { t } = useTranslation()

  if (!document.content) {
    return (
      <Card className="p-6 min-h-[40vh] flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>{t('documents.view.noContent', '暂无内容')}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 min-h-[40vh]">
      <div className="markdown-content">
        {(() => {
          const components = {
            img: (props: any) => (
              <img {...props} referrerPolicy="no-referrer" crossOrigin="anonymous" />
            ),
          }
          return (
          <MDEditor.Markdown
            source={document.content}
            style={{
              backgroundColor: 'transparent',
              color: 'inherit'
            }}
            data-color-mode="light"
            components={components}
          />
          )
        })()}
      </div>
    </Card>
  )
}
