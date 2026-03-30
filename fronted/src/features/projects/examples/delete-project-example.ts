/**
 * 删除项目接口对接示例
 * 
 * 接口信息：
 * - 方法: GET
 * - 路径: /project/deleteProject/{id}
 * - 参数: 项目ID (路径参数)
 * - 响应: {code: 0, message: "string", data: "string"}
 */

import { projectsService } from '../services/projects.service'
import { toast } from 'sonner'

/**
 * 删除项目示例
 */
export async function deleteProjectExample() {
  const projectId = '37' // 项目ID
  const projectName = '项目名111111' // 项目名称，用于确认

  try {
    // 1. 显示确认对话框
    const confirmed = window.confirm(
      `确定要删除项目"${projectName}"吗？此操作不可撤销。`
    )
    
    if (!confirmed) {
      // eslint-disable-next-line no-console
      console.log('用户取消删除操作')
      return
    }

    // 2. 调用删除接口
    // eslint-disable-next-line no-console
    console.log('开始删除项目:', projectId)
    await projectsService.delete(projectId)
    
    // 3. 删除成功处理
    // eslint-disable-next-line no-console
    console.log('项目删除成功')
    toast.success('项目删除成功')
    
    // 4. 更新本地状态而不是刷新页面
    // 如果在组件中，应该更新状态：setItems(prev => prev.filter(p => p.id !== projectId))
    // 或者重新获取数据：loadProjects()
    
  } catch (error: unknown) {
    const err = error as { message?: string }
    // 5. 错误处理
    // eslint-disable-next-line no-console
    console.error('删除项目失败:', error)
    toast.error(err.message || '删除项目失败，请稍后重试')
  }
}

/**
 * 批量删除项目示例
 */
export async function batchDeleteProjectsExample() {
  const projectIds = ['37', '38', '39'] // 要删除的项目ID列表
  const results: Array<{id: string, success: boolean, error?: string}> = []

  for (const projectId of projectIds) {
    try {
      await projectsService.delete(projectId)
      results.push({ id: projectId, success: true })
      // eslint-disable-next-line no-console
      console.log(`项目 ${projectId} 删除成功`)
    } catch (error: unknown) {
      const err = error as { message?: string }
      results.push({ 
        id: projectId, 
        success: false, 
        error: err.message 
      })
      // eslint-disable-next-line no-console
      console.error(`项目 ${projectId} 删除失败:`, error)
    }
  }

  // 统计结果
  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length

  if (failCount === 0) {
    toast.success(`成功删除 ${successCount} 个项目`)
  } else {
    toast.error(`删除完成：成功 ${successCount} 个，失败 ${failCount} 个`)
  }

  return results
}

/**
 * 安全删除项目示例（带二次确认）
 */
export async function safeDeleteProjectExample() {
  const project = {
    id: '37',
    name: '项目名111111',
    description: '项目描述'
  }

  try {
    // 1. 第一次确认
    const firstConfirm = window.confirm(
      `您即将删除项目"${project.name}"，此操作不可撤销。是否继续？`
    )
    
    if (!firstConfirm) return

    // 2. 第二次确认（需要输入项目名称）
    const inputName = window.prompt(
      `请输入项目名称"${project.name}"以确认删除：`
    )
    
    if (inputName !== project.name) {
      toast.error('项目名称不匹配，删除操作已取消')
      return
    }

    // 3. 执行删除
    await projectsService.delete(project.id)
    
    // 4. 成功处理
    toast.success('项目删除成功')
    // 更新本地状态而不是刷新页面
    // 如果在组件中，应该更新状态：setItems(prev => prev.filter(p => p.id !== project.id))
    
  } catch (error: unknown) {
    const err = error as { message?: string }
    // eslint-disable-next-line no-console
    console.error('删除项目失败:', error)
    toast.error(err.message || '删除项目失败')
  }
}

/**
 * React组件中使用删除功能的示例
 */
export const DeleteProjectComponent = `
import { useState } from 'react'
import { projectsService } from '../services/projects.service'
import { DeleteProjectDialog } from '../components/delete-project-dialog'
import { toast } from 'sonner'

export function ProjectList() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return
    
    setDeleting(true)
    try {
      await projectsService.delete(projectToDelete.id)
      toast.success('项目删除成功')
      setDeleteDialogOpen(false)
      // 更新本地状态，从列表中移除已删除的项目
      // setProjects(prev => prev.filter(p => p.id !== projectToDelete.id))
    } catch (error) {
      console.error('删除失败:', error)
      toast.error(error.message || '删除失败')
    } finally {
      setDeleting(false)
      setProjectToDelete(null)
    }
  }

  return (
    <>
      {/* 项目列表 */}
      <div className="project-list">
        {projects.map(project => (
          <div key={project.id} className="project-item">
            <h3>{project.name}</h3>
            <button onClick={() => handleDeleteClick(project)}>
              删除项目
            </button>
          </div>
        ))}
      </div>

      {/* 删除确认对话框 */}
      <DeleteProjectDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        project={projectToDelete}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />
    </>
  )
}
`

/**
 * API响应处理示例
 */
export const apiResponseHandling = {
  // 成功响应
  success: {
    code: 0,
    message: "删除成功",
    data: "项目已成功删除"
  },
  
  // 错误响应示例
  errors: [
    {
      code: 1001,
      message: "项目不存在",
      data: null
    },
    {
      code: 1002, 
      message: "无权限删除此项目",
      data: null
    },
    {
      code: 1003,
      message: "项目包含未完成的任务，无法删除",
      data: null
    }
  ]
}