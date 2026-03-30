import React from 'react'
import { AddStatusDialog } from './AddStatusDialog'
import { StatusCard } from './StatusCard'
import { useStatusContext } from './StatusProvider'

export const StatusManager: React.FC = () => {
  const { statuses } = useStatusContext()

  // 分离默认状态和自定义状态
  const defaultStatuses = statuses.filter((s) => s.isDefault)
  const customStatuses = statuses.filter((s) => !s.isDefault)

  return (
    <div className='mx-auto'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>状态</h1>
          {/* <p className='text-muted-foreground'>
            管理系统中的各种状态，如"进行中"、"已完成"等
          </p> */}
        </div>
        <AddStatusDialog />
      </div>

      <div className='mb-8'>
        <h2 className='mb-4 text-xl font-semibold'>默认状态</h2>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {defaultStatuses.map((status) => (
            <StatusCard key={status.id} status={status} />
          ))}
        </div>
      </div>

      {customStatuses.length > 0 && (
        <div>
          <h2 className='mb-4 text-xl font-semibold'>自定义状态</h2>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {customStatuses.map((status) => (
              <StatusCard key={status.id} status={status} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
