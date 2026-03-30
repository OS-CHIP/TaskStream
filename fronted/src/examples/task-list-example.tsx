import React, { useState, useEffect, useCallback } from 'react';
import { TaskService, QueryTaskPageRequest, QueryTaskPageResponse } from '../features/tasks/services/task-service';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TaskListExampleProps {
  projectId: string;
}

const TaskListExample: React.FC<TaskListExampleProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<QueryTaskPageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [priority, setPriority] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // 获取任务列表
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const request: QueryTaskPageRequest = {
        pageNum: currentPage.toString(),
        pageSize: pageSize.toString(),
        projectId: projectId,
        ...(priority && { priority }),
        ...(status && { status })
      };

      const response = await TaskService.queryTaskPage(request);
      setTasks(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取任务列表失败');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, projectId, priority, status]);

  // 初始加载
  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, fetchTasks]);

  // 处理筛选
  const handleFilter = () => {
    setCurrentPage(1);
    fetchTasks();
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 获取优先级显示文本
  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      '1': '高',
      '2': '中',
      '3': '低'
    };
    return priorityMap[priority] || priority;
  };

  // 获取状态显示文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      '1': '待开始',
      '2': '进行中',
      '3': '已完成',
      '4': '已取消',
      '5': '已阻塞'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>任务列表查询示例</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 筛选条件 */}
          <div className="flex gap-4 mb-4">
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="优先级" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="1">高</SelectItem>
                <SelectItem value="2">中</SelectItem>
                <SelectItem value="3">低</SelectItem>
              </SelectContent>
            </Select>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="1">待开始</SelectItem>
                <SelectItem value="2">进行中</SelectItem>
                <SelectItem value="3">已完成</SelectItem>
                <SelectItem value="4">已取消</SelectItem>
                <SelectItem value="5">已阻塞</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="number"
              placeholder="每页条数"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value) || 10)}
              className="w-24"
            />

            <Button onClick={handleFilter} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              查询
            </Button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* 任务列表 */}
          {tasks && (
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                共 {tasks.total} 条记录，第 {tasks.current} 页，共 {tasks.pages} 页
              </div>

              {tasks.records.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无任务数据
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.records.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-2">{task.taskTitle}</h3>
                          {task.description && (
                            <p className="text-gray-600 mb-2">{task.description}</p>
                          )}
                          <div className="flex gap-2 text-sm text-gray-500">
                            <span>ID: {task.id}</span>
                            <span>类型: {t(`tasks.types.${task.type}`, { defaultValue: task.type })}</span>
                            {task.estimatedHours && task.estimatedHours > 0 && (
                              <span>预估时间: {task.estimatedHours}h</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                            {getPriorityText(task.priority)}
                          </Badge>
                          <Badge variant={task.status === '3' ? 'default' : task.status === '2' ? 'secondary' : 'outline'}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t text-xs text-gray-400">
                          <div className="flex justify-between">
                            <span>创建时间: {task.createdAt ? (() => {
                              const d = new Date(task.createdAt)
                              return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
                            })() : '未知'}</span>
                            <span>更新时间: {task.updatedAt ? (() => {
                              const d = new Date(task.updatedAt)
                              return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
                            })() : '未知'}</span>
                          </div>
                        </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* 分页控件 */}
              {tasks.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(tasks.current - 1)}
                    disabled={tasks.current <= 1 || loading}
                  >
                    上一页
                  </Button>
                  
                  <span className="flex items-center px-3 text-sm">
                    {tasks.current} / {tasks.pages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(tasks.current + 1)}
                    disabled={tasks.current >= tasks.pages || loading}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskListExample;

// 使用示例
export const TaskListExampleUsage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">任务列表API使用示例</h1>
      <TaskListExample projectId="50" />
    </div>
  );
};