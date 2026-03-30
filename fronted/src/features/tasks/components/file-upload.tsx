import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download, 
  Trash2,
  FileVideo,
  FileAudio,
  Archive,
  Code,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'

export interface UploadedFile {
  id: string | number // 支持字符串和数字类型，因为后端返回的是数字
  name: string
  size: number
  type: string
  url?: string
  file?: File
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress?: number
  error?: string
  uploadedAt?: Date
  linkedToTask?: boolean // 标记文件是否已关联到任务
}

interface FileUploadProps {
  value?: UploadedFile[]
  onChange?: (files: UploadedFile[] | ((prev: UploadedFile[]) => UploadedFile[])) => void
  maxFiles?: number
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
  sourceType?: 'task' | 'comment' | 'project' | 'document'
}

export function FileUpload({
  value = [],
  onChange,
  maxFiles = 5,
  maxSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.md'],
  className,
  sourceType = 'task'
}: FileUploadProps) {
  const { t } = useTranslation()
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<(string | number)[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const valueRef = useRef<UploadedFile[]>(value)

  // 保持最新的value引用，避免异步闭包使用旧值
  if (valueRef.current !== value) {
    valueRef.current = value
  }

  // 调试：组件渲染时打印当前状态
  console.log('🔍 FileUpload 渲染 - value:', value, 'length:', value.length)

  const validateFile = useCallback((file: File): string | null => {
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return t('tasks.fileUpload.fileTooLarge', { size: maxSize })
    }

    // 检查文件类型
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      if (type.includes('*')) {
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      return file.type === type
    })

    if (!isValidType) {
      return t('tasks.fileUpload.invalidFileType', { types: acceptedTypes.join(',') })
    }

    return null
  }, [maxSize, acceptedTypes, t])

  const applyUpdate = useCallback((updateFn: (prev: UploadedFile[]) => UploadedFile[]) => {
    const next = updateFn(valueRef.current)
    valueRef.current = next
    onChange?.(next)
  }, [onChange])

  // 单个文件上传（用于重试功能）
  const uploadFile = useCallback(async (file: File, fileId: string) => {
    try {
      console.log('📤 uploadFile 开始 - fileId:', fileId)
      
      // 更新文件状态为上传中 - 使用函数式更新避免闭包问题
      applyUpdate(prevFiles => {
        console.log('📤 更新为上传中状态 - prevFiles:', prevFiles)
        const updatedFiles = prevFiles.map(f => 
          f.id === fileId 
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        )
        console.log('📤 更新为上传中状态后 - updatedFiles:', updatedFiles)
        return updatedFiles
      })

      // 调用批量上传API
      const response = await apiClient.uploadBatch([file], sourceType, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log('📊 进度更新 - progress:', progress)
            applyUpdate(prevFiles => {
              const updatedFiles = prevFiles.map(f => 
                f.id === fileId 
                  ? { ...f, progress }
                  : f
              )
              console.log('📊 进度更新后 - updatedFiles:', updatedFiles)
              return updatedFiles
            })
          }
        }
      })

      if (response.code === 200 && response.data && response.data.length > 0) {
        // 上传成功，更新文件状态，保存后端返回的完整文件信息
        const uploadedFileData = response.data[0]
        console.log('✅ 上传成功 - uploadedFileData:', uploadedFileData)
        
        applyUpdate(prevFiles => {
          console.log('✅ 上传成功前 - prevFiles:', prevFiles)
          const updatedFiles = prevFiles.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  id: uploadedFileData.id, // 使用后端返回的真实ID
                  status: 'success' as const, 
                  url: uploadedFileData.url, 
                  name: uploadedFileData.fileName || f.name, // 使用后端返回的文件名
                  progress: 100, 
                  uploadedAt: new Date(),
                  // 保留原始文件信息，不设置为undefined
                  file: f.file
                }
              : f
          )
          console.log('✅ 上传成功后更新 - updatedFiles:', updatedFiles)
          return updatedFiles
        })
        toast.success(`${file.name} 上传成功`)
      } else {
        throw new Error(response.msg || '上传失败：服务器返回错误')
      }
    } catch (error) {
      // 上传失败，更新文件状态
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      applyUpdate(prevFiles => {
        const updatedFiles = prevFiles.map(f => 
          f.id === fileId 
            ? { ...f, status: 'error' as const, error: errorMessage, progress: 0 }
            : f
        )
        return updatedFiles
      })
      toast.error(`${file.name} 上传失败: ${errorMessage}`)
    }
  }, [onChange])

  // 批量上传文件
  const uploadBatchFiles = useCallback(async (uploadedFiles: UploadedFile[]) => {
    console.log('📦 批量上传开始 - 文件数量:', uploadedFiles.length)
    
    // 提取实际的 File 对象
    const files = uploadedFiles.map(f => f.file).filter((file): file is File => file !== undefined)
    const fileIds = uploadedFiles.map(f => f.id)
    
    if (files.length === 0) {
      console.warn('⚠️ 没有有效的文件可上传')
      return
    }

    try {

      // 更新所有文件状态为上传中
      applyUpdate(prevFiles => {
        console.log('📦 批量更新为上传中状态 - prevFiles:', prevFiles)
        const updatedFiles = prevFiles.map(f => 
          fileIds.includes(f.id)
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        )
        console.log('📦 批量更新为上传中状态后 - updatedFiles:', updatedFiles)
        return updatedFiles
      })

      // 调用批量上传API
      const response = await apiClient.uploadBatch(files, sourceType, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log('📊 批量上传进度更新 - progress:', progress)
            // 所有文件同步更新进度
            applyUpdate(prevFiles => {
              const updatedFiles = prevFiles.map(f => 
                fileIds.includes(f.id)
                  ? { ...f, progress }
                  : f
              )
              console.log('📊 批量进度更新后 - updatedFiles:', updatedFiles)
              return updatedFiles
            })
          }
        }
      })

      if (response.code === 200 && response.data && response.data.length > 0) {
        // 批量上传成功，更新所有文件状态
        const uploadedFilesData = response.data
        console.log('✅ 批量上传成功 - uploadedFilesData:', uploadedFilesData)
        
        applyUpdate(prevFiles => {
          console.log('✅ 批量上传成功前 - prevFiles:', prevFiles)
          const updatedFiles = prevFiles.map(f => {
            const fileIndex = fileIds.indexOf(f.id)
            if (fileIndex !== -1 && uploadedFilesData[fileIndex]) {
              const uploadedFileData = uploadedFilesData[fileIndex]
              return {
                ...f,
                id: uploadedFileData.id, // 使用后端返回的真实ID
                status: 'success' as const,
                url: uploadedFileData.url,
                name: uploadedFileData.fileName || f.name, // 使用后端返回的文件名
                progress: 100,
                uploadedAt: new Date(),
                // 保留原始文件信息
                file: f.file
              }
            }
            return f
          })
          console.log('✅ 批量上传成功后更新 - updatedFiles:', updatedFiles)
          return updatedFiles
        })
        
        toast.success(`成功上传 ${files.length} 个文件`)
      } else if (response.code === 200) {
        // 后端返回空data但状态码成功，标记为成功以避免误报失败
        applyUpdate(prevFiles => {
          const updatedFiles = prevFiles.map(f => 
            fileIds.includes(f.id)
              ? { ...f, status: 'success' as const, progress: 100, uploadedAt: new Date() }
              : f
          )
          return updatedFiles
        })
        toast.success(`成功上传 ${files.length} 个文件`)
      } else {
        throw new Error(response.msg || '批量上传失败：服务器返回错误')
      }
    } catch (error) {
      // 批量上传失败，更新所有文件状态
      const errorMessage = error instanceof Error ? error.message : '批量上传失败'
      console.error('❌ 批量上传失败:', errorMessage)
      
      applyUpdate(prevFiles => {
        const updatedFiles = prevFiles.map(f => 
          fileIds.includes(f.id)
            ? { ...f, status: 'error' as const, error: errorMessage, progress: 0 }
            : f
        )
        return updatedFiles
      })
      toast.error(`批量上传失败: ${errorMessage}`)
    }
  }, [onChange])

  const handleFiles = useCallback(async (files: FileList) => {
    const newFiles: UploadedFile[] = []
    const validUploadedFiles: UploadedFile[] = []
    const errors: string[] = []

    // 检查文件数量限制
    if (value.length + files.length > maxFiles) {
      errors.push(t('tasks.fileUpload.maxFilesExceeded', { count: maxFiles }))
      return
    }

    Array.from(files).forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
        return
      }

      // 检查是否已存在同名文件
      if (value.some(f => f.name === file.name)) {
        errors.push(t('tasks.fileUpload.duplicateFile'))
        return
      }

      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        status: 'pending',
        progress: 0
      }

      newFiles.push(uploadedFile)
      validUploadedFiles.push(uploadedFile)
    })

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
    }

    if (newFiles.length > 0) {
      // 先添加文件到列表
      const updatedFiles = [...valueRef.current, ...newFiles]
      valueRef.current = updatedFiles
      onChange?.(updatedFiles)

      // 批量上传有效文件
      if (validUploadedFiles.length > 0) {
        console.log('📦 开始批量上传 - 有效文件数量:', validUploadedFiles.length)
        await uploadBatchFiles(validUploadedFiles)
      }
    }
  }, [value, onChange, maxFiles, validateFile, t, uploadBatchFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // 清空input值，允许重复选择同一文件
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const removeFile = useCallback(async (fileId: string | number) => {
    const fileToRemove = value.find(f => f.id === fileId)
    if (fileToRemove && fileToRemove.status === 'success') {
      try {
        const res = await apiClient.deleteAttachment(fileId)
        if (res.code !== 200 && res.code !== 0) {
          toast.error(res.msg || '删除附件失败')
          return
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : '删除附件失败'
        toast.error(msg)
        return
      }
    }
    const updatedFiles = value.filter(f => f.id !== fileId)
    onChange?.(updatedFiles)
    if (fileToRemove?.url && fileToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(fileToRemove.url)
    }
    setSelectedFiles(prev => prev.filter(id => id !== fileId))
    setShowDeleteConfirm(null)
    toast.success('附件已删除')
  }, [value, onChange])

  const removeSelectedFiles = useCallback(async () => {
    const needDeleteIds = selectedFiles.filter(id => {
      const f = value.find(x => x.id === id)
      return f && f.status === 'success'
    })
    if (needDeleteIds.length > 0) {
      const results = await Promise.allSettled(needDeleteIds.map(id => apiClient.deleteAttachment(id)))
      const failed = results.filter(r => r.status === 'rejected')
      const failedByCode = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.code !== 200 && (r.value as any)?.code !== 0)
      if (failed.length + failedByCode.length > 0) {
        toast.error('部分附件删除失败')
        return
      }
    }
    const updatedFiles = value.filter(f => !selectedFiles.includes(f.id))
    onChange?.(updatedFiles)
    selectedFiles.forEach(fileId => {
      const fileToRemove = value.find(f => f.id === fileId)
      if (fileToRemove?.url && fileToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.url)
      }
    })
    setSelectedFiles([])
    toast.success(`已删除 ${selectedFiles.length} 个文件`)
  }, [value, onChange, selectedFiles])

  const clearAllAttachments = useCallback(async () => {
    if (window.confirm('确定要清空所有上传的文件吗？这不会影响表单中的其他内容。')) {
      const successIds = value.filter(f => f.status === 'success').map(f => f.id)
      if (successIds.length > 0) {
        const results = await Promise.allSettled(successIds.map(id => apiClient.deleteAttachment(id)))
        const failed = results.filter(r => r.status === 'rejected')
        const failedByCode = results.filter(r => r.status === 'fulfilled' && (r.value as any)?.code !== 200 && (r.value as any)?.code !== 0)
        if (failed.length + failedByCode.length > 0) {
          toast.error('部分附件删除失败')
          return
        }
      }
      value.forEach(file => {
        if (file.url && typeof file.url === 'string' && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url)
        }
      })
      onChange?.([])
      setSelectedFiles([])
      toast.success('已清空文件列表')
    }
  }, [value, onChange])

  const retryUpload = useCallback((fileId: string | number) => {
    const fileToRetry = value.find(f => f.id === fileId)
    if (fileToRetry?.file) {
      uploadFile(fileToRetry.file, String(fileId))
    }
  }, [value, uploadFile])

  const downloadFile = useCallback((file: UploadedFile) => {
    if (file.url && typeof file.url === 'string') {
      // 如果是外部URL，直接打开
      if (file.url.startsWith('http')) {
        window.open(file.url, '_blank')
      } else {
        // 如果是本地文件，创建下载链接
        const link = document.createElement('a')
        link.href = file.url
        link.download = file.name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    }
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatUploadTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`
    
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (fileType: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    
    if (fileType.startsWith('image/')) {
      return <Image className="h-4 w-4 text-blue-500" />
    }
    if (fileType.startsWith('video/')) {
      return <FileVideo className="h-4 w-4 text-purple-500" />
    }
    if (fileType.startsWith('audio/')) {
      return <FileAudio className="h-4 w-4 text-green-500" />
    }
    if (fileType.includes('pdf')) {
      return <FileText className="h-4 w-4 text-red-500" />
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <Archive className="h-4 w-4 text-orange-500" />
    }
    if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml'].includes(extension || '')) {
      return <Code className="h-4 w-4 text-indigo-500" />
    }
    if (fileType.includes('document') || ['doc', 'docx', 'txt', 'md'].includes(extension || '')) {
      return <FileText className="h-4 w-4 text-blue-600" />
    }
    
    return <File className="h-4 w-4 text-gray-500" />
  }

  const getStatusIcon = (file: UploadedFile) => {
    switch (file.status) {
      case 'uploading':
        return <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return null
    }
  }

  const isUploading = value.some(f => f.status === 'uploading')
  const successfulUploads = value.filter(f => f.status === 'success')
  const failedUploads = value.filter(f => f.status === 'error')
  const canSelectFiles = successfulUploads.length > 0

  const handleSelectAll = useCallback(() => {
    if (selectedFiles.length === successfulUploads.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(successfulUploads.map(f => f.id))
    }
  }, [selectedFiles.length, successfulUploads])

  return (
    <div className={cn('space-y-4', className)}>
      {/* 上传区域 */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer group',
          isDragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.02]'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          (value.length >= maxFiles || isUploading) && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (value.length < maxFiles && !isUploading) {
            fileInputRef.current?.click()
          }
        }}
      >
        <Upload className={cn(
          "mx-auto h-10 w-10 mb-3 transition-colors",
          isDragOver ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
        )} />
        <p className="text-base font-medium text-gray-700 mb-2">
          {isUploading ? '正在上传文件...' : '拖拽文件到此处或点击上传'}
        </p>
        <p className="text-sm text-gray-500 mb-3">
          支持 {acceptedTypes.join(', ')} 格式，单个文件最大 {maxSize}MB
        </p>
        
        {/* 上传统计 */}
        <div className="flex justify-center items-center gap-6 text-sm">
          <span className="text-gray-600">
            {value.length}/{maxFiles} 个文件
          </span>
          {successfulUploads.length > 0 && (
            <span className="text-green-600 font-medium">
              ✓ {successfulUploads.length} 个已上传
            </span>
          )}
          {failedUploads.length > 0 && (
            <span className="text-red-600 font-medium">
              ✗ {failedUploads.length} 个失败
            </span>
          )}
        </div>
      </div>

      {/* 隐藏的文件输入 */}
      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* 文件列表 */}
      {value.length > 0 && (
        <div className="space-y-3">
          {/* 列表头部 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h4 className="text-base font-semibold text-gray-800">
                附件列表
              </h4>
              {canSelectFiles && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedFiles.length === successfulUploads.length && successfulUploads.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-gray-600">全选</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {selectedFiles.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeSelectedFiles}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  删除选中 ({selectedFiles.length})
                </Button>
              )}
              {value.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllAttachments}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  清空所有
                </Button>
              )}
              <span className="text-sm text-gray-500">
                共 {value.length} 个文件
              </span>
            </div>
          </div>
          
          {/* 文件列表 */}
          <div className="space-y-2">
            {value.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
                  file.status === 'success' && "bg-white border-gray-200 hover:border-gray-300",
                  file.status === 'error' && "bg-red-50 border-red-200",
                  file.status === 'uploading' && "bg-blue-50 border-blue-200",
                  file.status === 'pending' && "bg-gray-50 border-gray-200",
                  selectedFiles.includes(file.id) && "ring-2 ring-blue-500 ring-opacity-50"
                )}
              >
                {/* 选择框 */}
                {file.status === 'success' && (
                  <Checkbox
                    checked={selectedFiles.includes(file.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFiles(prev => [...prev, file.id])
                      } else {
                        setSelectedFiles(prev => prev.filter(id => id !== file.id))
                      }
                    }}
                    className="h-4 w-4"
                  />
                )}
                
                {/* 文件图标 */}
                <div className="flex-shrink-0">
                  {getFileIcon(file.type, file.name)}
                </div>
                
                {/* 文件信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    {file.linkedToTask && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        已关联
                      </span>
                    )}
                    {getStatusIcon(file)}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{formatFileSize(file.size)}</span>
                    {file.uploadedAt && (
                      <span>{formatUploadTime(file.uploadedAt)}</span>
                    )}
                    {file.status === 'uploading' && file.progress !== undefined && (
                      <span className="text-blue-600 font-medium">{file.progress}%</span>
                    )}
                  </div>
                  
                  {/* 进度条 */}
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-1.5" />
                    </div>
                  )}
                  
                  {/* 错误信息 */}
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      {file.error}
                    </p>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-1">
                  {file.status === 'success' && file.url && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="下载文件"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {file.status === 'error' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => retryUpload(file.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="重试上传"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* 删除确认 */}
                  {showDeleteConfirm === file.id ? (
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        title="确认删除"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(null)}
                        className="h-8 w-8 p-0 text-gray-400 hover:bg-gray-50"
                        title="取消删除"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(file.id)}
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="删除文件"
                      disabled={file.status === 'uploading'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
