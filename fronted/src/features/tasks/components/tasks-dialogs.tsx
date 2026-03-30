


import { ConfirmDialog } from '@/components/confirm-dialog'
import { TaskService } from '../services/task-service'
import { toast } from 'sonner'
import { useTasks } from '../context/tasks-context'
import { TasksImportDialog } from './tasks-import-dialog'
import { useTranslation } from 'react-i18next'
import { FillProgressDialog } from './fill-progress-dialog'


export function TasksDialogs() {
  const { open, setOpen, currentRow, setCurrentRow, fetchTasks } = useTasks()

  const { t } = useTranslation()

  return (
    <>
      <TasksImportDialog
        key='tasks-import'
        open={open === 'import'}
        onOpenChange={() => setOpen('import')}
      />

      {currentRow && (
        <>


          <ConfirmDialog
            key='task-delete'
            destructive
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'delete' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            handleConfirm={async () => {
              if (!currentRow?.id) return
              
              try {
                const result = await TaskService.deleteTask(parseInt(currentRow.id))
                if (result.code === 200) {
                  setOpen(null)
                  setTimeout(() => {
                    setCurrentRow(null)
                  }, 500)
                  toast.success(result.msg || t('tasks.delete.success'))
                  // 调用列表接口重新获取任务列表
                  fetchTasks()
                } else {
                  toast.error(result.msg || t('tasks.delete.error'))
                }
              } catch (error) {
                console.error('删除任务失败:', error)
                toast.error(t('tasks.delete.error'))
              }
            }}
            className='max-w-md'
            title={`${t('tasks.delete.title')}: ${currentRow.id} ?`}
            desc={
              <>
                {t('tasks.delete.description')}{' '}
                <strong>{currentRow.id}</strong>. <br />
                {t('tasks.delete.warning')}
              </>
            }
            confirmText={t('tasks.delete.confirmText')}
          />
          
          <FillProgressDialog
            key='fill-progress'
            open={open === 'progress'}
            onOpenChange={(isOpen) => {
              setOpen(isOpen ? 'progress' : null)
              if (!isOpen) {
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            task={currentRow as any}
            onSuccess={() => {
              setOpen(null)
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
              fetchTasks()
            }}
          />
        </>
      )}
    </>
  )
}
