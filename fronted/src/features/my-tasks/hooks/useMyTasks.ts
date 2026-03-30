import { useState, useEffect, useCallback } from 'react';
import { TaskService } from '../../tasks/services/task-service';
import { Task } from '../../tasks/data/schema';

export interface UseMyTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadMore: () => void;
  refresh: () => void;
}

export const useMyTasks = (): UseMyTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const pageSize = 20;

  const fetchTasks = useCallback(async (page: number, query: string, isRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 从localStorage获取项目ID
      const projectId = localStorage.getItem('selected_project_id');
      if (!projectId) {
        throw new Error('未找到项目ID，请先选择项目');
      }

      const response = await TaskService.queryMyTasksPage({
        pageNum: page.toString(),
        pageSize: pageSize.toString(),
        projectId,
        taskTitle: query || undefined,
      });

      const newTasks = response.records || [];
      
      if (isRefresh || page === 1) {
        setTasks(newTasks);
      } else {
        setTasks(prev => [...prev, ...newTasks]);
      }
      
      // 计算总页数
      const totalPages = Math.ceil((response.total || 0) / pageSize);
      setHasMore(page < totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取任务列表失败';
      setError(errorMessage);
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [pageSize]);

  // 初始加载
  useEffect(() => {
    fetchTasks(1, searchQuery, true);
    setCurrentPage(1);
  }, [fetchTasks, searchQuery]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchTasks(nextPage, searchQuery);
    }
  }, [loading, hasMore, currentPage, searchQuery, fetchTasks]);

  // 刷新数据
  const refresh = useCallback(() => {
    setCurrentPage(1);
    fetchTasks(1, searchQuery, true);
  }, [searchQuery, fetchTasks]);

  // 搜索查询变化时重置页码
  const handleSearchQueryChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  return {
    tasks,
    loading: loading && isInitialLoad,
    error,
    hasMore,
    searchQuery,
    setSearchQuery: handleSearchQueryChange,
    loadMore,
    refresh,
  };
};
