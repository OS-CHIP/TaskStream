import React, { useState, useEffect } from 'react'
import { Status } from '@/types/status'
import { TemplateTypes } from '@/types/templates'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStatusContext } from './StatusProvider'

interface EditStatusDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  status: Status
}

export const EditStatusDialog: React.FC<EditStatusDialogProps> = ({
  open,
  onOpenChange,
  status,
}) => {
  const [name, setName] = useState(status.name)
  const [description, setDescription] = useState(status.description || '')
  const [color, setColor] = useState(status.color)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    status.applicableTypes
  )

  const { updateStatus } = useStatusContext()

  useEffect(() => {
    if (open) {
      setName(status.name)
      setDescription(status.description || '')
      setColor(status.color)
      setSelectedTypes(status.applicableTypes)
    }
  }, [open, status])

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

    updateStatus(status.id, {
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      applicableTypes: selectedTypes,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>编辑状态</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-name'>状态名称</Label>
            <Input
              id='edit-name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-description'>状态描述（可选）</Label>
            <Input
              id='edit-description'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='edit-color'>颜色</Label>
            <div className='flex items-center space-x-2'>
              <Input
                id='edit-color'
                type='color'
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className='h-10 w-10 p-1'
              />
              <Input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className='flex-1'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label>适用类型</Label>
            <div className='grid grid-cols-2 gap-2'>
              {TemplateTypes.map((type) => (
                <div key={type} className='flex items-center space-x-2'>
                  <Checkbox
                    id={`edit-type-${type}`}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => handleTypeToggle(type)}
                  />
                  <label
                    htmlFor={`edit-type-${type}`}
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
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type='submit'>保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
