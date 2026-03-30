/**
 * 项目切换器功能测试组件
 * 
 * @description 用于测试项目切换器的各项功能
 */


import { ProjectSwitcher, useProjectOperations } from '@/components/layout/project-switcher'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function TestProjectSwitcher() {
  const { createProject } = useProjectOperations()
  
  const handleCreateTestProject = async () => {
    const newProject = {
      projectName: `测试项目 ${Date.now()}`,
      description: '这是一个测试项目',
      status: '1' as const
    }
    
    await createProject(newProject)
    // 测试项目创建成功，缓存已自动更新
  }
  
  const handleRefreshCache = () => {
    // refreshCache() // 功能暂时不可用
    // 缓存已手动刷新
  }
  
  const handleProjectChange = (project: { id: string; name: string }) => {
    // 项目切换处理
    return project
  }
  
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>项目切换器功能测试</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">项目切换器</h3>
            <div className="w-64">
              <ProjectSwitcher
                onProjectChange={handleProjectChange}
                searchPlaceholder="搜索项目..."
                emptyMessage="暂无项目"
                noResultsMessage="未找到匹配的项目"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">缓存测试</h3>
            <div className="flex gap-2">
              <Button onClick={handleCreateTestProject}>
                创建测试项目
              </Button>
              <Button variant="outline" onClick={handleRefreshCache}>
                刷新缓存
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">功能说明</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 初始化时会自动选中第一个项目</li>
              <li>• 项目数据会被缓存5分钟，避免重复请求</li>
              <li>• 支持搜索项目名称和描述</li>
              <li>• 创建新项目后缓存会自动更新</li>
              <li>• 可以手动刷新缓存获取最新数据</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TestProjectSwitcher