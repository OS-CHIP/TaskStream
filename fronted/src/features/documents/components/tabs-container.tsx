import { Card } from '@/components/ui/card'
import * as Tabs from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import { Document } from '../types/document'
import { DocumentAttachments } from './document-attachments'
import { DocumentContent } from './document-content'

interface TabsContainerProps {
  document: Document
}

export function TabsContainer({ document }: TabsContainerProps) {
  const { t } = useTranslation()
  
  // 检查是否有附件
  const hasAttachments = document.attachments && document.attachments.length > 0
  
  return (
    <Card className="p-6">
      <Tabs.Root defaultValue="content" className="w-full">
        {hasAttachments && (
          <Tabs.List className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground mb-6 grid grid-cols-1">
            <Tabs.Trigger
              value="attachments"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              {t('documents.tabs.attachments')}
            </Tabs.Trigger>
          </Tabs.List>
        )}
        
        <Tabs.Content value="content" className="space-y-4 mt-0">
          <DocumentContent document={document} />
        </Tabs.Content>
        
        {hasAttachments && (
          <Tabs.Content value="attachments" className="space-y-4 mt-0">
            <DocumentAttachments document={document} />
          </Tabs.Content>
        )}
      </Tabs.Root>
    </Card>
  )
}
