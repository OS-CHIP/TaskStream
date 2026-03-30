import { useState, useEffect } from 'react'
import { TemplateTypes } from '@/types/templates'
import { defaultStatuses } from '../data/defaultStatuses'
import { Status } from '../types/status'

export const useStatus = () => {
  const [statuses, setStatuses] = useState<Status[]>([])
  const [statusTypes] = useState<string[]>(TemplateTypes)

  useEffect(() => {
    // 初始化时加载所有默认状态
    setStatuses(Object.values(defaultStatuses))

    // // 尝试从localStorage加载自定义状态
    // const savedCustomStatuses = localStorage.getItem('customStatuses')
    // if (savedCustomStatuses) {
    //   const customStatuses = JSON.parse(savedCustomStatuses)
    //   setStatuses((prev) => [...prev, ...customStatuses])
    // }
  }, [])

  const getStatusesByType = (typeId: string): Status[] => {
    return statuses.filter((status) => status.applicableTypes.includes(typeId))
  }

  const addStatus = (status: Omit<Status, 'id'>) => {
    const newStatus = {
      ...status,
      id: `custom-${Date.now()}`,
    }

    setStatuses((prev) => [...prev, newStatus])

    // // 保存到localStorage
    // const customStatuses = statuses.filter((s) => !s.isDefault)
    // const updatedCustomStatuses = [...customStatuses, newStatus]
    // localStorage.setItem(
    //   'customStatuses',
    //   JSON.stringify(updatedCustomStatuses)
    // )
  }

  const updateStatus = (id: string, updates: Partial<Status>) => {
    setStatuses((prev) =>
      prev.map((status) =>
        status.id === id ? { ...status, ...updates } : status
      )
    )

    // // 更新localStorage
    // const customStatuses = statuses
    //   .filter((s) => !s.isDefault)
    //   .map((status) => (status.id === id ? { ...status, ...updates } : status))
    // localStorage.setItem('customStatuses', JSON.stringify(customStatuses))
  }

  const deleteStatus = (id: string) => {
    setStatuses((prev) => prev.filter((status) => status.id !== id))

    // // 更新localStorage
    // const customStatuses = statuses.filter((s) => !s.isDefault && s.id !== id)
    // localStorage.setItem('customStatuses', JSON.stringify(customStatuses))
  }

  return {
    statuses,
    statusTypes,
    getStatusesByType,
    addStatus,
    updateStatus,
    deleteStatus,
  }
}
