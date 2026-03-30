import { FileText } from 'lucide-react'

interface DocumentDescriptionProps {
  description: string
}

export function DocumentDescription({ description }: DocumentDescriptionProps) {
  if (!description || description.trim() === '') {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-500" />
        <h3 className="text-sm font-medium text-gray-700">简介</h3>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">
        <p className="whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  )
}
