import React from 'react'
import { InstanceCreatorProps } from '@/types/instance'
import { useInstanceCreator } from '@/hooks/useInstanceCreator'
import { InstanceForm } from './Form'
import { InstanceHeader } from './Header'

export const InstanceCreator: React.FC<InstanceCreatorProps> = ({
  template,
  onSuccess,
  onCancel,
  onSaveDraft,
  mode = 'page',
  className = '',
}) => {
  const {
    fieldValues,
    errors,
    isSubmitting,
    handleFieldChange,
    handleSubmit,
    handleSaveDraft,
    resetForm,
  } = useInstanceCreator(template)

  const handleFormSubmit = async () => {
    const instance = await handleSubmit()
    if (instance) {
      resetForm()
      onSuccess?.(instance)
    }
  }

  const handleSaveAsDraft = () => {
    const draftData = handleSaveDraft()
    onSaveDraft?.(draftData)
  }

  const handleCancel = () => {
    resetForm()
    onCancel?.()
  }

  return (
    <div className={className}>
      <div
        className={
          mode === 'page'
            ? 'mx-auto max-w-4xl p-6'
            : 'bg-card rounded-lg border p-4'
        }
      >
        <InstanceHeader
          template={template}
          onBack={onCancel}
          onSaveDraft={onSaveDraft ? handleSaveAsDraft : undefined}
          mode={mode}
        />

        <InstanceForm
          template={template}
          fieldValues={fieldValues}
          errors={errors}
          isSubmitting={isSubmitting}
          onFieldChange={handleFieldChange}
          onSubmit={handleFormSubmit}
          onCancel={onCancel ? handleCancel : undefined}
          submitLabel={mode === 'embedded' ? '创建实例' : '创建'}
          showCancel={mode === 'page' || !!onCancel}
        />
      </div>
    </div>
  )
}
