/**
 * 修改项目接口对接示例
 * 
 * API信息：
 * - 方法: POST
 * - 路径: /project/updateProject
 * - 请求参数: {id: number, projectName: string, picAddr: null, description: string}
 * - 返回格式: {code: number, message: string, data: string}
 */

import { projectsService } from '../services/projects.service'
import { toast } from 'sonner'

/**
 * 修改项目示例
 */
export async function updateProjectExample() {
  const projectId = '35' // 项目ID
  const updateData = {
    name: '项目名222',
    description: '描述'
  }

  try {
    // eslint-disable-next-line no-console
    console.log('开始修改项目:', projectId, updateData)
    
    // 调用修改接口
    const updatedProject = await projectsService.update(projectId, updateData)
    
    // 修改成功处理
    // eslint-disable-next-line no-console
    console.log('项目修改成功:', updatedProject)
    toast.success('项目修改成功')
    
    // 更新本地状态
    // 如果在组件中，应该更新状态：setItems(prev => prev.map(p => p.id === projectId ? updatedProject : p))
    
  } catch (error: unknown) {
    // 错误处理
    const err = error as { message?: string }
    // eslint-disable-next-line no-console
    console.error('修改项目失败:', error)
    toast.error(err.message || '修改项目失败，请稍后重试')
  }
}

/**
 * 批量修改项目示例
 */
export async function batchUpdateProjectsExample() {
  const updates = [
    { id: '35', name: '项目A', description: '项目A描述' },
    { id: '36', name: '项目B', description: '项目B描述' },
    { id: '37', name: '项目C', description: '项目C描述' }
  ]
  
  const results: Array<{id: string, success: boolean, error?: string}> = []

  for (const update of updates) {
    try {
      await projectsService.update(update.id, {
        name: update.name,
        description: update.description
      })
      results.push({ id: update.id, success: true })
      // eslint-disable-next-line no-console
      console.log(`项目 ${update.id} 修改成功`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      results.push({ 
        id: update.id, 
        success: false, 
        error: err.message || '未知错误'
      })
      // eslint-disable-next-line no-console
      console.error(`项目 ${update.id} 修改失败:`, error)
    }
  }

  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  if (failCount === 0) {
    toast.success(`成功修改 ${successCount} 个项目`)
  } else {
    toast.error(`修改完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  }

  return results
}

/**
 * 表单验证修改项目示例
 */
export async function validateAndUpdateProjectExample() {
  const projectId = '35'
  const formData = {
    projectName: '项目名222',
    description: '描述'
  }

  try {
    // 1. 表单验证
    if (!formData.projectName.trim()) {
      toast.error('项目名称不能为空')
      return
    }

    if (formData.projectName.length > 50) {
      toast.error('项目名称不能超过50个字符')
      return
    }

    if (formData.description && formData.description.length > 200) {
      toast.error('项目描述不能超过200个字符')
      return
    }

    // 2. 执行修改
    const updatedProject = await projectsService.update(projectId, {
      name: formData.projectName,
      description: formData.description
    })

    // 3. 成功处理
    toast.success('项目修改成功')
    // eslint-disable-next-line no-console
    console.log('修改后的项目:', updatedProject)
    
    return updatedProject
    
  } catch (error: unknown) {
    const err = error as { message?: string }
    // eslint-disable-next-line no-console
    console.error('修改项目失败:', error)
    toast.error(err.message || '修改项目失败')
    throw error
  }
}

/**
 * React组件中使用修改功能的示例
 */
export const UpdateProjectComponent = `
import { useState } from 'react'
import { projectsService } from '../services/projects.service'
import { toast } from 'sonner'

export function EditProjectDialog({ project, open, onOpenChange }) {
  const [formData, setFormData] = useState({
    projectName: project?.name || '',
    description: project?.description || ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!project) return
    
    setSubmitting(true)
    try {
      const updatedProject = await projectsService.update(project.id, {
        name: formData.projectName,
        description: formData.description
      })
      
      toast.success('项目修改成功')
      onOpenChange(false)
      
      // 更新本地状态
      // setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p))
      
    } catch (error) {
      console.error('修改失败:', error)
      toast.error(error.message || '修改失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改项目</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label>项目名称</label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  projectName: e.target.value
                }))}
                required
                maxLength={50}
              />
            </div>
            
            <div>
              <label>项目描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                maxLength={200}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
`