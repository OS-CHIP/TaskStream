import { FileInfo } from "@/types/templates"

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateFile = (
  file: File,
  accept?: string,
  maxSize?: number
): string | null => {
  // 检查文件类型
  if (accept) {
    const acceptedTypes = accept.split(',').map((type) => type.trim())
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const fileType = file.type.toLowerCase()

    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith('.')) {
        return type.toLowerCase() === fileExtension
      } else if (type.includes('/')) {
        return fileType === type.toLowerCase()
      } else if (type === 'image/*') {
        return fileType.startsWith('image/')
      } else if (type === 'video/*') {
        return fileType.startsWith('video/')
      } else if (type === 'audio/*') {
        return fileType.startsWith('audio/')
      }
      return false
    })

    if (!isValidType) {
      return `文件类型不支持，请上传 ${accept} 格式的文件`
    }
  }

  // 检查文件大小
  if (maxSize && file.size > maxSize * 1024 * 1024) {
    return `文件大小不能超过 ${maxSize}MB`
  }

  return null
}

export const createFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    } else {
      resolve('')
    }
  })
}

export const downloadFile = (fileInfo: FileInfo) => {
  const link = document.createElement('a')
  link.href = fileInfo.url
  link.download = fileInfo.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
