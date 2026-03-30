import { useState } from 'react'
import { FileInfo } from '@/types/templates'
import {
  validateFile,
  createFilePreview,
} from '../utils/fileUtils'

interface UseFileUploadProps {
  multiple?: boolean
  accept?: string
  maxSize?: number
  onFilesChange?: (files: FileInfo[]) => void
}

export const useFileUpload = ({
  multiple = false,
  accept,
  maxSize,
  onFilesChange,
}: UseFileUploadProps) => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const uploadFile = async (file: File): Promise<FileInfo> => {
    // 这里应该是实际的上传逻辑，这里模拟上传
    const previewUrl = await createFilePreview(file)

    return {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // 实际项目中应该是服务器返回的URL
      previewUrl,
      uploadedAt: new Date(),
    }
  }

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return

    const newFiles: File[] = Array.from(selectedFiles)
    const newErrors: string[] = []

    // 验证文件
    for (const file of newFiles) {
      const error = validateFile(file, accept, maxSize)
      if (error) {
        newErrors.push(`${file.name}: ${error}`)
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])
    setIsUploading(true)

    try {
      const uploadPromises = newFiles.map(uploadFile)
      const uploadedFiles = await Promise.all(uploadPromises)

      const updatedFiles = multiple
        ? [...files, ...uploadedFiles]
        : uploadedFiles
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    } catch (_error) {
      setErrors(['文件上传失败，请重试'])
    } finally {
      setIsUploading(false)
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter((file) => file.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange?.(updatedFiles)
  }

  const clearFiles = () => {
    setFiles([])
    onFilesChange?.([])
  }

  return {
    files,
    isUploading,
    errors,
    handleFileSelect,
    removeFile,
    clearFiles,
  }
}
