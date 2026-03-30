import { useState, useEffect, useCallback } from 'react'
import type { Document } from '../types/document'
import { getDocumentDetail } from '../services/document-service'

interface UseDocumentState {
  document: Document | null
  loading: boolean
  error: string | null
}

interface UseDocumentReturn extends UseDocumentState {
  refetch: () => Promise<void>
}

/**
 * Hook for fetching and managing a single document
 * @param documentId - The ID of the document to fetch
 * @returns Document data, loading state, error state, and refetch function
 */
export function useDocument(documentId: string): UseDocumentReturn {
  const [state, setState] = useState<UseDocumentState>({
    document: null,
    loading: true,
    error: null,
  })

  const fetchDocument = useCallback(async () => {
    if (!documentId) return
    
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const doc = await getDocumentDetail(documentId)
      if (doc) {
        setState({
          document: doc,
          loading: false,
          error: null,
        })
      } else {
        setState({
          document: null,
          loading: false,
          error: '文档未找到',
        })
      }
    } catch (err) {
      setState({
        document: null,
        loading: false,
        error: err instanceof Error ? err.message : '获取文档失败',
      })
    }
  }, [documentId])

  useEffect(() => {
    if (documentId) {
      fetchDocument()
    }
  }, [documentId, fetchDocument])

  const refetch = async () => {
    await fetchDocument()
  }

  return {
    ...state,
    refetch,
  }
}
