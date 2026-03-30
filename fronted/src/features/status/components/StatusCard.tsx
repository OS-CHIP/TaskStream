import React, { useState } from 'react'
import { Status } from '@/types/status'
import { TemplateTypes } from '@/types/templates'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditStatusDialog } from './EditStatusDialog'
import { useStatusContext } from './StatusProvider'

interface StatusCardProps {
  status: Status
}

export const StatusCard: React.FC<StatusCardProps> = ({ status }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const { deleteStatus } = useStatusContext()

  const handleDelete = () => {
    if (window.confirm(`确定要删除状态"${status.name}"吗？`)) {
      deleteStatus(status.id)
    }
  }

  // 获取适用的类型名称
  const getApplicableTypeNames = () => {
    return status.applicableTypes.map((typeId) => {
      const type = TemplateTypes.find((t) => t === typeId)
      return type ? type : typeId
    })
  }

  return (
    <>
      <div className='bg-card flex flex-col rounded-lg border p-4'>
        <div className='mb-2 flex items-start justify-between'>
          <div className='flex items-center space-x-2'>
            <div
              className='h-4 w-4 flex-shrink-0 rounded-full'
              style={{ backgroundColor: status.color }}
            />
            <h3 className='font-semibold'>{status.name}</h3>
          </div>
          {status.isDefault ? (
            <Badge variant='secondary' className='text-xs'>
              默认
            </Badge>
          ) : (
            <div className='flex space-x-1'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setEditDialogOpen(true)}
              >
                编辑
              </Button>
              <Button variant='ghost' size='sm' onClick={handleDelete}>
                删除
              </Button>
            </div>
          )}
        </div>

        {status.description && (
          <p className='text-muted-foreground mb-2 text-sm'>
            {status.description}
          </p>
        )}

        <div className='mt-2'>
          <span className='text-muted-foreground text-xs'>适用类型: </span>
          <div className='mt-1 flex flex-wrap gap-1'>
            {getApplicableTypeNames().map((typeName, index) => (
              <Badge key={index} variant='outline' className='text-xs'>
                {typeName}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <EditStatusDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        status={status}
      />
    </>
  )
}
