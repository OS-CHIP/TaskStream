import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useStatus } from '@/hooks/useStatus'
import { Status } from '@/types/status'

interface StatusContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  error: string | null
  setError: (error: string | null) => void
  success: string | null
  setSuccess: (success: string | null) => void
  statuses: Status[]
  statusTypes: string[]
  getStatusesByType: (typeId: string) => Status[]
  addStatus: (status: Omit<Status, 'id'>) => void
  updateStatus: (id: string, updates: Partial<Status>) => void
  deleteStatus: (id: string) => void
}

const StatusContext = createContext<StatusContextType | undefined>(undefined)

interface StatusProviderProps {
  children: ReactNode
}

const StatusProvider: React.FC<StatusProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { statuses, statusTypes, getStatusesByType, addStatus, updateStatus, deleteStatus } = useStatus()

  const value: StatusContextType = {
    isLoading,
    setIsLoading,
    error,
    setError,
    success,
    setSuccess,
    statuses,
    statusTypes,
    getStatusesByType,
    addStatus,
    updateStatus,
    deleteStatus,
  }

  return (
    <StatusContext.Provider value={value}>
      {children}
    </StatusContext.Provider>
  )
}

// Fix for Fast Refresh warning
StatusProvider.displayName = 'StatusProvider'

export const useStatusContext = () => {
  const context = useContext(StatusContext)
  if (context === undefined) {
    throw new Error('useStatusContext must be used within a StatusProvider')
  }
  return context
}

export { StatusProvider }
