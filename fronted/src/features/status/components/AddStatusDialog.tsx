import React, { useState } from 'react'
import { Status } from '@/types/status'
import { TemplateTypes } from '@/types/templates'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStatusContext } from './StatusProvider'

interface AddStatusDialogProps {
  trigger?: React.ReactNode
}

export const AddStatusDialog: React.FC<AddStatusDialogProps> = ({
  trigger = <Button>添加状态</Button>,
}) => {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3B82F6')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'requirement',
    'task',
    'bug',
    'test',
  ])

  const { addStatus } = useStatusContext()

  const handleTypeToggle = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId)
        ? prev.filter((id) => id !== typeId)
        : [...prev, typeId]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || selectedTypes.length === 0) return

    const newStatus: Omit<Status, 'id'> = {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      applicableTypes: selectedTypes,
      order: 100, // 自定义状态放在最后
    }

    addStatus(newStatus)

    // 重置表单
    setName('')
    setDescription('')
    setColor('#3B82F6')
    setSelectedTypes(['requirement', 'task', 'bug', 'test'])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>添加新状态</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>状态名称</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='例如：进行中、已完成'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>状态描述（可选）</Label>
            <Input
              id='description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='描述此状态的含义'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='color'>颜色</Label>
            <div className='flex items-center space-x-2'>
              <Input
                id='color'
                type='color'
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className='h-10 w-10 p-1'
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className='flex-1'
                placeholder='#3B82F6'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>适用类型</Label>
            <div className='grid grid-cols-2 gap-2'>
              {TemplateTypes.map((type) => (
                <div key={type} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <label
                    htmlFor={`type-${type}`}
                    className='text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    {type}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className='flex justify-end space-x-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type='submit'>添加</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
