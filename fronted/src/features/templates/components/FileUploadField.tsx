import React, { useRef } from 'react'
import { TemplateField } from '@/types/templates'
import { X, Upload, File, Image, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatFileSize } from '@/utils/fileUtils'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FileUploadFieldProps {
  field: TemplateField
  value: unknown
  onChange: (fieldId: string, value: unknown) => void
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  field,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { files, isUploading, errors, handleFileSelect, removeFile } =
    useFileUpload({
      multiple: field.multiple,
      accept: field.accept,
      maxSize: field.maxSize,
      onFilesChange: (files) => onChange(field.id, files),
    })

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className='h-4 w-4' />
    if (fileType.startsWith('video/')) return <Video className='h-4 w-4' />
    return <File className='h-4 w-4' />
  }

  return (
    <div className='space-y-3'>
      <Label htmlFor={field.id}>
        {field.name}
        {field.required && <span className='ml-1 text-red-500'>*</span>}
      </Label>

      <div className='space-y-3'>
        {/* 文件上传区域 */}
        <div
          className={cn(
            'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
            'hover:border-primary cursor-pointer',
            isUploading && 'cursor-not-allowed opacity-50'
          )}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <Input
            ref={fileInputRef}
            type='file'
            multiple={field.multiple}
            accept={field.accept}
            onChange={handleFileInputChange}
            className='hidden'
            disabled={isUploading}
          />

          <Upload className='text-muted-foreground mx-auto mb-2 h-8 w-8' />
          <p className='text-muted-foreground text-sm'>
            {isUploading ? '上传中...' : '点击或拖拽文件到此处'}
          </p>
          <p className='text-muted-foreground mt-1 text-xs'>
            {field.accept && `支持格式: ${field.accept}`}
            {field.maxSize && `, 最大: ${field.maxSize}MB`}
          </p>
        </div>

        {/* 错误信息 */}
        {errors.length > 0 && (
          <div className='rounded-lg border border-red-200 bg-red-50 p-3'>
            {errors.map((error, index) => (
              <p key={index} className='text-sm text-red-700'>
                {error}
              </p>
            ))}
          </div>
        )}

        {/* 文件列表 */}
        {files.length > 0 && (
          <div className='space-y-2'>
            <p className='text-muted-foreground text-sm'>已上传文件:</p>
            {files.map((file) => (
              <div
                key={file.id}
                className='bg-card flex items-center justify-between rounded-lg border p-3'
              >
                <div className='flex min-w-0 flex-1 items-center space-x-3'>
                  {getFileIcon(file.type)}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{file.name}</p>
                    <p className='text-muted-foreground text-xs'>
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => removeFile(file.id)}
                  className='text-destructive hover:text-destructive'
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
