import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MarkdownEditorField } from '@/features/tasks/components/markdown-editor'
import { FileUpload, type UploadedFile } from '@/features/tasks/components/file-upload'
import { createDocumentSchema, type CreateDocumentInput, documentTypes } from '../types/document'

interface DocumentFormProps {
  mode: 'create' | 'edit'
  onSubmit: (data: CreateDocumentInput) => void
  onCancel: () => void
  initialData?: Partial<CreateDocumentInput>
  isLoading?: boolean
}

export function DocumentForm({ mode, onSubmit, onCancel, initialData }: DocumentFormProps) {
  const { t } = useTranslation()

  const form = useForm<CreateDocumentInput>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: {
      title: '',
      description: '',
      type: documentTypes[0],
      content: '',
      attachments: [],
      ...initialData,
    },
  })

  const handleSubmit = (data: CreateDocumentInput) => {
    const attachments = Array.isArray(data.attachments)
      ? (data.attachments as UploadedFile[]).filter((f) => f.status === 'success')
      : []
    onSubmit({ ...data, attachments })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 文档标题 */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t('documents.form.title')}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t('documents.form.titlePlaceholder')}
                  className="h-10"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 文档描述 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t('documents.form.description')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('documents.form.descriptionPlaceholder')}
                  className="min-h-[80px] resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 文档类型 */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t('documents.form.type')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={t('documents.form.typePlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 文档内容 */}
        <FormField
          control={form.control}
          name="content"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t('documents.form.content')}</FormLabel>
              <FormControl>
                <MarkdownEditorField
                  field={field}
                  fieldState={fieldState}
                  label=""
                  placeholder={t('documents.form.contentPlaceholder')}
                  required={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 附件上传 */}
        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">{t('documents.form.attachments')}</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value as UploadedFile[]}
                  onChange={field.onChange}
                  maxFiles={5}
                  maxSize={10}
                  acceptedTypes={['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.md']}
                  sourceType="document"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            {t('common.cancel')}
          </Button>
          <Button type="submit" className="px-6">
            {mode === 'create' ? t('documents.form.create') : t('documents.form.save')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
