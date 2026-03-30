import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { TopNav } from '@/components/layout/top-nav';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search as SearchComponent } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { LanguageSwitch } from '@/components/language-switch';
import { NotificationBell } from '@/components/notification-bell';
import { Search, GitBranch, Clock, CheckCircle, XCircle, AlertCircle, ZoomIn, ZoomOut, RotateCcw, ChevronDown } from 'lucide-react';
import { TaskService, QueryTaskPageRequest, TaskRelation } from '@/features/tasks/services/task-service';
import { Task as ApiTask } from '@/features/tasks/data/schema';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

// 任务接口定义
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  parentIds: string[]; // 修改为支持多个父级任务
  childIds: string[];
  assignee?: string;
  assigner?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

// 图形节点位置
interface NodePosition {
  x: number;
  y: number;
}

// 任务节点接口
interface TaskNode extends Task {
  level: number;
  children: TaskNode[];
  parent?: TaskNode;
  position: NodePosition;
}

// 状态配置
const statusConfig = {
  [TaskStatus.PENDING]: {
    color: '#6b7280',
    bgColor: '#f3f4f6',
    icon: Clock
  },
  [TaskStatus.IN_PROGRESS]: {
    color: '#3b82f6',
    bgColor: '#dbeafe',
    icon: GitBranch
  },
  [TaskStatus.COMPLETED]: {
    color: '#10b981',
    bgColor: '#d1fae5',
    icon: CheckCircle
  },
  [TaskStatus.BLOCKED]: {
    color: '#ef4444',
    bgColor: '#fee2e2',
    icon: XCircle
  },
  [TaskStatus.CANCELLED]: {
    color: '#f97316',
    bgColor: '#fed7aa',
    icon: AlertCircle
  }
};

// 优先级配置
const priorityConfig = {
  low: { color: '#10b981' },
  medium: { color: '#f59e0b' },
  high: { color: '#ef4444' }
};

// 扁平化任务数据转换函数
const transformFlatTaskToComponentTask = (flatTask: any): Task => {
  // 状态映射：API状态 -> 组件状态
  const mapApiStatusToComponentStatus = (apiStatus: string): TaskStatus => {
    switch (apiStatus) {
      case '1': return TaskStatus.PENDING;      // 待开始
      case '2': return TaskStatus.IN_PROGRESS;  // 进行中
      case '3': return TaskStatus.COMPLETED;    // 已完成
      case '4': return TaskStatus.CANCELLED;    // 已取消
      case '5': return TaskStatus.BLOCKED;      // 已阻塞
      default: return TaskStatus.PENDING;
    }
  };

  // 优先级映射：API优先级 -> 组件优先级
  const mapApiPriorityToComponentPriority = (apiPriority: string): 'low' | 'medium' | 'high' => {
    switch (apiPriority) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      case '1': return 'low';
      case '2': return 'medium';
      case '3': return 'high';
      default: return 'medium';
    }
  };

  return {
    id: flatTask.id.toString(),
    title: flatTask.taskTitle,
    description: flatTask.description || '',
    status: mapApiStatusToComponentStatus(flatTask.status),
    parentIds: [], // 将从relations数组中填充
    childIds: [], // 将从relations数组中填充
    assignee: flatTask.assignee || undefined,
    assigner: flatTask.assigner || undefined,
    priority: mapApiPriorityToComponentPriority(flatTask.priority),
    createdAt: flatTask.createTime ? new Date(flatTask.createTime) : new Date(),
    updatedAt: flatTask.updateTime ? new Date(flatTask.updateTime) : new Date()
  };
};

// 从relations数组构建任务关系的函数
const buildTaskRelationships = (tasks: Task[], relations: TaskRelation[]): Task[] => {
  // 创建任务映射
  const taskMap = new Map<string, Task>();
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, parentIds: [], childIds: [] });
  });

  // 根据relations构建父子关系
  relations.forEach(relation => {
    const notDeleted = String(relation.isDeleted) === '0';
    const type = String(relation.relationType || '').toUpperCase();
    if (notDeleted && (type === 'DEPENDS_ON' || type === '')) {
      const parentId = relation.parentTaskId.toString();
      const childId = relation.childTaskId.toString();
      const parentTask = taskMap.get(parentId);
      const childTask = taskMap.get(childId);
      if (parentTask && childTask) {
        if (!parentTask.childIds.includes(childId)) {
          parentTask.childIds.push(childId);
        }
        if (!childTask.parentIds.includes(parentId)) {
          childTask.parentIds.push(parentId);
        }
      }
    }
  });

  return Array.from(taskMap.values());
};



// API数据转换函数
const transformApiTaskToComponentTask = (apiTask: ApiTask, allTasks: ApiTask[]): Task => {
  // 状态映射：API状态 -> 组件状态
  const mapApiStatusToComponentStatus = (apiStatus: string): TaskStatus => {
    switch (apiStatus) {
      case '1': return TaskStatus.PENDING;      // 待开始
      case '2': return TaskStatus.IN_PROGRESS;  // 进行中
      case '3': return TaskStatus.COMPLETED;    // 已完成
      case '4': return TaskStatus.CANCELLED;    // 已取消
      case '5': return TaskStatus.BLOCKED;      // 已阻塞
      default: return TaskStatus.PENDING;
    }
  };

  // 优先级映射：API优先级 -> 组件优先级
  const mapApiPriorityToComponentPriority = (apiPriority: string): 'low' | 'medium' | 'high' => {
    switch (apiPriority) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      case '1': return 'low';
      case '2': return 'medium';
      case '3': return 'high';
      default: return 'medium';
    }
  };

  // 查找子任务ID
  const findChildIds = (taskId: string): string[] => {
    return allTasks
      .filter(task => {
        if (!task.parentTask || task.parentTask.length === 0) return false;
        return task.parentTask.some(parent => 
          typeof parent === 'string' ? parent === taskId : parent.id === taskId
        );
      })
      .map(task => task.id);
  };

  // 获取负责人名称
  const getAssigneeName = (assignee: any): string | undefined => {
    if (typeof assignee === 'string') return assignee;
    if (typeof assignee === 'number') return `用户${assignee}`;
    if (assignee && typeof assignee === 'object' && assignee.name) return assignee.name;
    return undefined;
  };
  const getAssignerName = (assigner: any): string | undefined => {
    if (typeof assigner === 'string') return assigner;
    if (typeof assigner === 'number') return `用户${assigner}`;
    if (assigner && typeof assigner === 'object' && assigner.name) return assigner.name;
    return undefined;
  };

  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || '',
    status: mapApiStatusToComponentStatus(apiTask.status),
    parentIds: apiTask.parentTask && apiTask.parentTask.length > 0 
      ? apiTask.parentTask.map(parent => typeof parent === 'string' ? parent : parent.id)
      : [],
    childIds: findChildIds(apiTask.id),
    assignee: getAssigneeName(apiTask.assignee),
    assigner: getAssignerName((apiTask as any).assigner),
    priority: mapApiPriorityToComponentPriority(apiTask.priority),
    createdAt: apiTask.createdAt || new Date(),
    updatedAt: apiTask.updatedAt || new Date()
  };
};



interface TaskRelationshipGraphProps {
  tasks?: Task[];
  initialTaskId?: string;
  taskId?: string; // 用于获取扁平化任务数据的任务ID
}

export const TaskRelationshipGraph: React.FC<TaskRelationshipGraphProps> = ({
  tasks: propTasks,
  initialTaskId = 'task-1',
  taskId
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // 分离的数据状态
  const [leftTasks, setLeftTasks] = useState<Task[]>([]); // 左侧任务列表数据
  const [relationshipTasks, setRelationshipTasks] = useState<Task[]>(propTasks || []); // 右侧关系图数据
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  
  // 组件状态
  const [leftSelectedTaskId, setLeftSelectedTaskId] = useState<string>(initialTaskId); // 左侧列表选中状态
  const [rightSelectedTaskId, setRightSelectedTaskId] = useState<string>(initialTaskId); // 右侧图形选中状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);



  // 获取左侧任务列表数据
  const fetchLeftTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 从localStorage获取项目ID
      const projectId = localStorage.getItem('selected_project_id');
      if (!projectId) {
        throw new Error('未找到项目ID，请先选择项目');
      }

      // 构建查询参数
      const params: QueryTaskPageRequest = {
        pageNum: '1',
        pageSize: '100', // 获取更多数据以构建完整的列表
        projectId: projectId
      };

      // 调用API获取任务数据
      const response = await TaskService.queryTaskPage(params);
      
      // 转换API数据为组件所需格式
      const transformedTasks = response.records.map(apiTask => {
        const base = transformApiTaskToComponentTask(apiTask, response.records);
        const assignee = resolveUserName((apiTask as any).assignee);
        const assigner = resolveUserName((apiTask as any).assigner);
        return { ...base, assignee, assigner };
      });

      // 只更新左侧任务列表
      setLeftTasks(transformedTasks);
      
      // 如果没有传入初始任务ID且有数据，使用第一个任务作为初始任务
      if (!propTasks && transformedTasks.length > 0 && !transformedTasks.find(t => t.id === initialTaskId)) {
        setLeftSelectedTaskId(transformedTasks[0].id);
        // 同时获取第一个任务的关系图数据
        fetchTaskRelationshipData(transformedTasks[0].id);
      }
    } catch (err) {
      console.error('获取左侧任务列表失败:', err);
      setError(err instanceof Error ? err.message : '获取左侧任务列表失败');
      // 清空任务数据，显示错误状态
      setLeftTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (!propTasks) {
      // 总是先获取左侧任务列表
      fetchLeftTasks();
      
      if (taskId) {
        // 如果传入了taskId，同时获取该任务的关系图数据
        fetchTaskRelationshipData(taskId);
      }
    }
  }, [propTasks, taskId]);
  useEffect(() => {
    const loadUsers = async () => {
      const projectId = localStorage.getItem('selected_project_id');
      if (!projectId) return;
      try {
        const list = await TaskService.getProjectUsers(projectId);
        if (Array.isArray(list) && list.length > 0) {
          const map: Record<string, string> = {};
          list.forEach(u => {
            map[String(u.value)] = u.label;
          });
          setUserMap(map);
        } else {
          setUserMap({});
        }
      } catch {
        setUserMap({});
      }
    };
    loadUsers();
  }, []);
  const resolveUserName = (val: any): string | undefined => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'object' && val.name) return String(val.name).trim() || undefined;
    if (typeof val === 'number') {
      const key = String(val);
      const name = userMap[key];
      return name ? (String(name).trim() || String(val)) : String(val);
    }
    const str = String(val).trim();
    if (!str) return undefined;
    const direct = userMap[str];
    if (direct) return String(direct).trim() || str;
    const numeric = /^\d+$/.test(str) ? str : undefined;
    if (numeric && userMap[numeric]) return String(userMap[numeric]).trim() || numeric;
    // 兼容后端返回的字符串数字与用户表中的数字ID，使用宽松相等匹配
    for (const k in userMap) {
      // eslint-disable-next-line eqeqeq
      if ((val as any) == (k as any)) {
        const nm = userMap[k];
        return String(nm).trim() || String(k);
      }
    }
    return str;
  };
  useEffect(() => {
    if (!userMap || Object.keys(userMap).length === 0) return;
    setLeftTasks(prev => prev.map(t => ({
      ...t,
      assignee: resolveUserName(t.assignee),
      assigner: resolveUserName(t.assigner),
    })));
    setRelationshipTasks(prev => prev.map(t => ({
      ...t,
      assignee: resolveUserName(t.assignee),
      assigner: resolveUserName(t.assigner),
    })));
  }, [userMap]);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTaskId, setDialogTaskId] = useState<string | null>(null);

  // 创建任务映射（用于关系图）
  const relationshipTaskMap = useMemo(() => {
    const map = new Map<string, Task>();
    relationshipTasks.forEach(task => map.set(task.id, task));
    return map;
  }, [relationshipTasks]);



  // 合并的任务映射（优先使用关系图数据，回退到左侧数据）
  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    leftTasks.forEach(task => map.set(task.id, task));
    relationshipTasks.forEach(task => map.set(task.id, task)); // 关系图数据覆盖左侧数据
    return map;
  }, [leftTasks, relationshipTasks]);

  // 递归构建任务树并计算位置
  /**
   * 递归构建任务树并计算位置
   * @param taskId 任务ID
   * @param level 层级
   * @param visited 已访问任务ID集合
   * @returns 任务节点
   */
  const buildTaskTree = (taskId: string, level: number = 0, visited: Set<string> = new Set()): TaskNode | null => {
    if (visited.has(taskId)) return null;
    
    const task = relationshipTaskMap.get(taskId);
    if (!task) return null;

    visited.add(taskId);

    // 处理阻塞状态传播 - 只有任意父任务阻塞时才传播到子任务
    const getEffectiveStatus = (task: Task, parentStatuses: TaskStatus[]): TaskStatus => {
      // 如果任意父任务是阻塞状态，子任务也变为阻塞状态
      if (parentStatuses.some(status => status === TaskStatus.BLOCKED)) {
        return TaskStatus.BLOCKED;
      }
      
      // 否则保持任务自己的状态
      return task.status;
    };

    // 获取所有父任务状态（使用关系图数据）
    const parentStatuses = task.parentIds
      .map(parentId => relationshipTaskMap.get(parentId))
      .filter(parent => parent !== undefined)
      .map(parent => parent!.status);
    
    const effectiveStatus = getEffectiveStatus(task, parentStatuses);
    
    const children = task.childIds
      .map(childId => buildTaskTree(childId, level + 1, visited))
      .filter((child): child is TaskNode => child !== null);

    const taskNode: TaskNode = {
      ...task,
      status: effectiveStatus,
      level,
      children,
      position: { x: 0, y: 0 } // 初始位置，后续计算
    };

    children.forEach(child => {
      child.parent = taskNode;
    });

    return taskNode;
  };

  // 计算节点位置
  const calculatePositions = (rootNode: TaskNode): TaskNode => {
    const levelHeight = 150;
    const siblingSpacing = 250;

    // 计算每个层级的节点数量
    const levelCounts = new Map<number, number>();
    const countNodes = (node: TaskNode) => {
      levelCounts.set(node.level, (levelCounts.get(node.level) || 0) + 1);
      node.children.forEach(countNodes);
    };
    countNodes(rootNode);

    // 为每个层级分配索引
    const levelIndices = new Map<number, number>();
    
    const assignPositions = (node: TaskNode) => {
      const levelIndex = levelIndices.get(node.level) || 0;
      const levelCount = levelCounts.get(node.level) || 1;
      
      // 计算水平位置（居中分布）
      const totalWidth = (levelCount - 1) * siblingSpacing;
      const startX = -totalWidth / 2;
      node.position.x = startX + levelIndex * siblingSpacing;
      
      // 计算垂直位置
      node.position.y = node.level * levelHeight;
      
      levelIndices.set(node.level, levelIndex + 1);
      
      node.children.forEach(assignPositions);
    };

    assignPositions(rootNode);
    return rootNode;
  };

  // 获取所有根任务（没有父任务的任务）
  const getAllRootTasks = (): Task[] => {
    return Array.from(relationshipTaskMap.values()).filter(task => task.parentIds.length === 0);
  };



  // 构建所有任务树（包括多个根节点和独立节点）
  const buildAllTaskTrees = (): TaskNode[] => {
    const allNodes: TaskNode[] = [];
    const processedTasks = new Set<string>();
    const globalVisited = new Set<string>(); // 全局 visited Set，避免重复处理节点
    
    // 首先处理所有根任务
    const rootTasks = getAllRootTasks();
    let xOffset = 0;
    
    rootTasks.forEach((rootTask) => {
      if (!processedTasks.has(rootTask.id)) {
        const rootNode = buildTaskTree(rootTask.id, 0, globalVisited);
        if (rootNode) {
          // 为每个根任务树设置不同的水平偏移
          const positionedRootNode = calculatePositions(rootNode);
          offsetNodePositions(positionedRootNode, xOffset, 0);
          
          // 收集这个树的所有节点
          const treeNodes = collectAllNodes(positionedRootNode);
          allNodes.push(...treeNodes);
          
          // 标记这些节点为已处理
          treeNodes.forEach(node => processedTasks.add(node.id));
          
          // 计算下一个树的水平偏移
          const treeWidth = getTreeWidth(positionedRootNode);
          xOffset += treeWidth + 300; // 300px 间距
        }
      }
    });
    
    // 处理剩余的独立节点（没有父子关系的节点）
    const remainingTasks = Array.from(relationshipTaskMap.values()).filter(
      task => !processedTasks.has(task.id)
    );
    
    remainingTasks.forEach((task, index) => {
      const isolatedNode: TaskNode = {
        ...task,
        level: 0,
        children: [],
        position: { x: xOffset + (index * 200), y: 0 }
      };
      allNodes.push(isolatedNode);
    });
    
    return allNodes;
  };

  // 偏移节点位置
  const offsetNodePositions = (node: TaskNode, offsetX: number, offsetY: number) => {
    node.position.x += offsetX;
    node.position.y += offsetY;
    node.children.forEach(child => offsetNodePositions(child, offsetX, offsetY));
  };

  // 获取树的宽度
  const getTreeWidth = (rootNode: TaskNode): number => {
    const allTreeNodes = collectAllNodes(rootNode);
    const xPositions = allTreeNodes.map(node => node.position.x);
    return Math.max(...xPositions) - Math.min(...xPositions) + 140; // 140 是节点宽度
  };

  // 收集所有节点
  const collectAllNodes = (node: TaskNode): TaskNode[] => {
    const nodes = [node];
    node.children.forEach(child => {
      nodes.push(...collectAllNodes(child));
    });
    return nodes;
  };

  // 获取所有节点（包括多个根节点和独立节点）
  const allNodes = useMemo(() => {
    if (relationshipTasks.length === 0) return [];
    return buildAllTaskTrees();
  }, [relationshipTasks]);



  // 过滤任务（使用左侧任务列表数据）
  const filteredTasks = useMemo(() => {
    return leftTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.assignee?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [leftTasks, searchTerm, statusFilter]);

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 缩放控制
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 获取右侧关系图数据
  const fetchTaskRelationshipData = async (targetTaskId: string) => {
    try {
      // 不设置loading状态，避免影响左侧列表的显示
      setError(null);
      
      // 调用新的任务关系API
      const relationshipData = await TaskService.getTasksWithMultipleParentsAndChildren(targetTaskId);
      
      // 转换任务数据为组件所需格式
      const transformedTasks = relationshipData.tasks.map((flatTask: any) => {
        const base = transformFlatTaskToComponentTask(flatTask);
        const assignee = resolveUserName(flatTask.assignee);
        const assigner = resolveUserName((flatTask as any).assigner);
        return { ...base, assignee, assigner };
      });
      
      // 使用relations数组构建任务关系
      const tasksWithRelationships = buildTaskRelationships(transformedTasks, relationshipData.relations);
      
      // 只更新右侧关系图的数据，不影响左侧任务列表
      setRelationshipTasks(tasksWithRelationships);
      
      // 设置右侧图形的选中任务ID
      setRightSelectedTaskId(targetTaskId);
      
    } catch (err) {
      console.error('获取任务关系数据失败:', err);
      setError(err instanceof Error ? err.message : '获取任务关系数据失败');
      // 清空关系图数据
      setRelationshipTasks([]);
    }
  };



  // 处理任务点击
  const handleTaskClick = (taskId: string) => {
    setDialogTaskId(taskId);
    setIsDialogOpen(true);
  };

  // 处理左侧列表任务选中
  const handleLeftTaskSelect = (taskId: string) => {
    setLeftSelectedTaskId(taskId);
    // 同时获取该任务的关系图数据
    fetchTaskRelationshipData(taskId);
  };

  // 处理右侧图形节点选中
  const handleRightNodeSelect = (taskId: string) => {
    setRightSelectedTaskId(taskId);
    // 可以选择是否同时更新关系图数据，这里我们只更新选中状态
  };

  

  // 渲染连接线（支持多父级任务）
  const renderConnections = () => {
    const connections: React.ReactElement[] = [];
    const drawnConnections = new Set<string>(); // 避免重复绘制连接线
    
    // 根据父子节点状态决定连接线颜色
    const getConnectionColor = (parentStatus: TaskStatus, childStatus: TaskStatus) => {
      // 如果父子节点都是已完成，连线是已完成颜色
      if (parentStatus === TaskStatus.COMPLETED && childStatus === TaskStatus.COMPLETED) {
        return '#22c55e'; // 绿色
      }
      
      // 如果父子节点有一个是待处理，连线是待处理颜色
      if (parentStatus === TaskStatus.PENDING || childStatus === TaskStatus.PENDING) {
        return '#6b7280'; // 灰色
      }
      
      // 如果父子节点都是进行中，连线是进行中颜色
      if (parentStatus === TaskStatus.IN_PROGRESS && childStatus === TaskStatus.IN_PROGRESS) {
        return '#3b82f6'; // 蓝色
      }
      
      // 如果有阻塞状态，连线是阻塞颜色
      if (parentStatus === TaskStatus.BLOCKED || childStatus === TaskStatus.BLOCKED) {
        return '#dc2626'; // 红色
      }
      
      // 如果有取消状态，连线是取消颜色
      if (parentStatus === TaskStatus.CANCELLED || childStatus === TaskStatus.CANCELLED) {
        return '#374151'; // 深灰色
      }
      
      // 默认颜色
      return '#94a3b8';
    };

    // 为所有可见的任务节点绘制连接线（支持多父任务）
    allNodes.forEach(node => {
      // 为每个父任务绘制到当前节点的连接线
      node.parentIds.forEach(parentId => {
        const parentNode = allNodes.find(n => n.id === parentId);
        if (!parentNode) return;

        const connectionKey = `${parentId}-${node.id}`;
        if (drawnConnections.has(connectionKey)) return;
        drawnConnections.add(connectionKey);

        const startX = parentNode.position.x;
        const startY = parentNode.position.y + 25; // 调整连接点位置
        const endX = node.position.x;
        const endY = node.position.y - 25;
        
        const lineColor = getConnectionColor(parentNode.status, node.status);
        const isBlocked = parentNode.status === TaskStatus.BLOCKED || node.status === TaskStatus.BLOCKED;
        const lineWidth = isBlocked ? '3' : '2';
        
        // 创建贝塞尔曲线路径
        const midY = (startY + endY) / 2;
        const path = `M ${startX} ${startY} C ${startX} ${midY} ${endX} ${midY} ${endX} ${endY}`;
        
        connections.push(
          <path
            key={connectionKey}
            d={path}
            stroke={lineColor}
            strokeWidth={lineWidth}
            fill="none"
            opacity={isBlocked ? "0.8" : "0.7"}
          />
        );
      });
    });
    
    return connections;
  };

  // 渲染节点
  const renderNode = (node: TaskNode) => {
    const config = statusConfig[node.status];
    const isSelected = node.id === rightSelectedTaskId;
    const assigneeLabel = t('tasks.columns.assignee') || '负责人';
    const assignerLabel = t('tasks.columns.assigner') || '分配人';
    const unassignedText = t('common.unassigned') || '未分配';
    
    return (
      <g key={node.id} transform={`translate(${node.position.x}, ${node.position.y})`}>
        
        {/* 节点背景 - 使用状态颜色 */}
        <rect
          x="-70"
          y="-25"
          width="140"
          height="50"
          rx="8"
          fill={config.bgColor}
          stroke={config.color}
          strokeWidth={isSelected ? 3 : 2}
          className="cursor-pointer transition-all duration-300 hover:shadow-lg"
          onClick={() => handleRightNodeSelect(node.id)}
          onDoubleClick={() => handleTaskClick(node.id)}
        />
        
        {/* 任务标题 */}
        <text
          x="0"
          y="-8"
          textAnchor="middle"
          className="font-medium"
          style={{ 
            fontSize: '13px',
            fill: node.status === TaskStatus.BLOCKED ? '#dc2626' : '#374151'
          }}
        >
          {node.title.length > 16 ? `${node.title.substring(0, 16)}...` : node.title}
        </text>
        
        {/* 负责人 */}
        <text
          x="0"
          y="8"
          textAnchor="middle"
          style={{ 
            fontSize: '11px',
            fill: node.status === TaskStatus.BLOCKED ? '#dc2626' : '#6b7280'
          }}
        >
          {`${assigneeLabel}: ${node.assignee || unassignedText}`}
        </text>

        {/* 分配人 */}
        <text
          x="0"
          y="22"
          textAnchor="middle"
          style={{
            fontSize: '11px',
            fill: node.status === TaskStatus.BLOCKED ? '#dc2626' : '#6b7280'
          }}
        >
          {`${assignerLabel}: ${node.assigner || unassignedText}`}
        </text>
        
        {/* 子任务数量指示器 */}
        {node.children.length > 0 && (
          <g transform="translate(55, -15)">
            <circle
              r="8"
              fill={config.color}
              opacity="0.8"
            />
            <text
              textAnchor="middle"
              dy="3"
              className="fill-white font-bold"
              style={{ fontSize: '9px' }}
            >
              {node.children.length}
            </text>
          </g>
        )}
      </g>
    );
  };

  
  const topNav = [
    {
      title: t('navigation.taskGraph'),
      href: '/task-graph',
      isActive: true,
      disabled: false,
    },
  ];

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <SearchComponent />
          <LanguageSwitch />
          <ThemeSwitch />
          <NotificationBell />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main className="flex flex-col overflow-hidden h-[calc(100vh-4rem)]">
        <div className="flex flex-col h-full overflow-hidden">
          {/* 标题和控制面板 */}
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between flex-shrink-0 mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">{t('taskGraph.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('taskGraph.subtitle')}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={t('taskGraph.toolbar.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-8 w-full sm:w-48 text-sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | 'all')}>
                <SelectTrigger size="sm" className="w-full sm:w-32 text-sm">
                  <SelectValue placeholder={t('taskGraph.toolbar.filterStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('taskGraph.toolbar.allStatus')}</SelectItem>
                  {Object.entries(statusConfig).map(([status]) => (
                    <SelectItem key={status} value={status}>
                      {status === TaskStatus.PENDING
                        ? t('tasks.status.todo')
                        : status === TaskStatus.IN_PROGRESS
                        ? t('tasks.status.inProgress')
                        : status === TaskStatus.COMPLETED
                        ? t('tasks.status.done')
                        : status === TaskStatus.BLOCKED
                        ? t('tasks.status.blocked')
                        : t('tasks.status.canceled')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* 任务列表 */}
            <div className="xl:col-span-1 flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-2 flex-shrink-0 px-4 pt-4">
                  <CardTitle className="text-base">{t('taskGraph.list.title')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto px-4 pb-2">
                    <div className="space-y-1 py-2">
                  {filteredTasks.map(task => {
                    const config = statusConfig[task.status];
                    const Icon = config.icon;
                    const isSelected = task.id === leftSelectedTaskId;
                    
                    return (
                      <div key={task.id} className="relative">
                        {/* 选中状态的背景 */}
                        {isSelected && (
                          <div className="absolute inset-0 selected-task-bg rounded-md animate-pulse" />
                        )}
                        
                        <Button
                          variant={isSelected ? "default" : "ghost"}
                          className={`w-full justify-start h-auto !px-3 !py-2 text-left relative transition-all duration-300 ${
                            isSelected 
                              ? 'ring-2 ring-primary/50 shadow-lg transform scale-[1.02] bg-primary' 
                              : 'hover:bg-gray-50 hover:scale-[1.01]'
                          }`}
                          onClick={() => handleLeftTaskSelect(task.id)}
                          onDoubleClick={() => handleTaskClick(task.id)}
                        >
                          <div className="flex items-center gap-2 w-full min-w-0">
                            {isSelected ? (
                              <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-white animate-bounce" />
                            ) : (
                              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm truncate transition-all duration-300 ${
                                isSelected ? 'text-white' : ''
                              }`}>
                                {task.title}
                              </div>
                              <div className={`text-xs truncate transition-all duration-300 ${
                                isSelected ? 'text-primary-foreground/75' : 'text-muted-foreground'
                              }`}>
                                {task.assignee || (t('common.unassigned') || '未分配')}
                              </div>
                            </div>
                            <div 
                              className={`w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                                isSelected ? 'animate-ping' : ''
                              }`}
                              style={{ 
                                backgroundColor: isSelected ? 'white' : config.color,
                                boxShadow: isSelected ? '0 0 8px rgba(255,255,255,0.8)' : 'none'
                              }}
                            />
                          </div>
                          
                          {/* 选中状态的边框动画 */}
                          {isSelected && (
                            <div className="absolute inset-0 rounded-md border-2 border-white/30 animate-pulse" />
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

            {/* 可视化图表区域 */}
            <div className="xl:col-span-4 flex flex-col min-h-0">
              <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="pb-2 flex-shrink-0 px-4 pt-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{t('taskGraph.chart.title')}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={handleZoomOut}>
                        <ZoomOut className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleResetView}>
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleZoomIn}>
                        <ZoomIn className="h-3.5 w-3.5" />
                      </Button>
                      <span className="text-xs text-muted-foreground min-w-[50px] ml-1">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('taskGraph.instructions')}
                  </p>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                  <div className="relative w-full flex-1 overflow-hidden bg-gray-50/50">
                    {/* 加载状态 */}
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-muted-foreground">{t('taskGraph.loading')}</p>
                        </div>
                      </div>
                    )}
                    
                    {/* 错误状态 */}
                    {error && !loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-3 max-w-md text-center">
                          <AlertCircle className="h-12 w-12 text-red-500" />
                          <div>
                            <h3 className="text-lg font-semibold text-red-700 mb-2">{t('taskGraph.error.title')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">{error}</p>
                            <Button 
                              onClick={() => fetchLeftTasks()} 
                              variant="outline" 
                              size="sm"
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              {t('common.retry')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                <svg
                  ref={svgRef}
                  width="100%"
                  height="100%"
                  className="cursor-grab active:cursor-grabbing"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <defs>
                    <marker
                      id="arrowhead"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#94a3b8"
                      />
                    </marker>
                    <marker
                      id="arrowhead-blocked"
                      markerWidth="10"
                      markerHeight="7"
                      refX="9"
                      refY="3.5"
                      orient="auto"
                    >
                      <polygon
                        points="0 0, 10 3.5, 0 7"
                        fill="#dc2626"
                      />
                    </marker>
                  </defs>
                  
                  <g transform={`translate(${400 + pan.x}, ${100 + pan.y}) scale(${zoom})`}>
                    {/* 渲染连接线 */}
                    {!loading && !error && renderConnections()}
                    
                    {/* 渲染节点 */}
                    {!loading && !error && allNodes.map(renderNode)}
                  </g>
                </svg>
                
                    {/* 图例 */}
                    <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-md shadow-sm border z-10">
                      <h4 className="text-xs font-medium mb-1">{t('taskGraph.legend.title')}</h4>
                      <div className="space-y-0.5">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <div key={status} className="flex items-center gap-1">
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: config.color }}
                            />
                            <span className="text-xs whitespace-nowrap">
                              {status === TaskStatus.PENDING
                                ? t('tasks.status.todo')
                                : status === TaskStatus.IN_PROGRESS
                                ? t('tasks.status.inProgress')
                                : status === TaskStatus.COMPLETED
                                ? t('tasks.status.done')
                                : status === TaskStatus.BLOCKED
                                ? t('tasks.status.blocked')
                                : t('tasks.status.canceled')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* 任务详情弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('tasks.actions.view') || '查看'}</DialogTitle>
          </DialogHeader>
          {dialogTaskId && taskMap.get(dialogTaskId) && (
            (() => {
              const task = taskMap.get(dialogTaskId)!;
              const config = statusConfig[task.status];
              const Icon = config.icon;
              const priorityStyle = priorityConfig[task.priority];
              const assigneeLabel = t('tasks.columns.assignee') || '负责人';
              const assignerLabel = t('tasks.columns.assigner') || '分配人';
              const unassignedText = t('common.unassigned') || '未分配';
              
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Icon className="h-5 w-5" />
                    <h3 className="text-xl font-semibold">{task.title}</h3>
                    <Badge style={{ backgroundColor: config.bgColor, color: config.color }}>
                      {task.status === TaskStatus.PENDING
                        ? t('tasks.status.todo')
                        : task.status === TaskStatus.IN_PROGRESS
                        ? t('tasks.status.inProgress')
                        : task.status === TaskStatus.COMPLETED
                        ? t('tasks.status.done')
                        : task.status === TaskStatus.BLOCKED
                        ? t('tasks.status.blocked')
                        : t('tasks.status.canceled')}
                    </Badge>
                    <Badge variant="outline" style={{ color: priorityStyle.color, borderColor: priorityStyle.color }}>
                      {t('tasks.priority.' + task.priority)}
                    </Badge>
                  </div>
                  
                  {task.description && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t('taskGraph.details.description')}</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">{task.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{assigneeLabel}:</span>
                        <span>{task.assignee || unassignedText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{assignerLabel}:</span>
                        <span>{task.assigner || unassignedText}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{t('taskGraph.details.taskId')}:</span>
                        <span className="font-mono text-xs">{task.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{t('taskGraph.details.priority')}:</span>
                        <span style={{ color: priorityStyle.color }}>{t('tasks.priority.' + task.priority)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{t('taskGraph.details.createdAt')}:</span>
                        <span className="text-xs">{task.createdAt.getFullYear()}/{String(task.createdAt.getMonth() + 1).padStart(2, '0')}/{String(task.createdAt.getDate()).padStart(2, '0')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{t('taskGraph.details.updatedAt')}:</span>
                        <span className="text-xs">{task.updatedAt.getFullYear()}/{String(task.updatedAt.getMonth() + 1).padStart(2, '0')}/{String(task.updatedAt.getDate()).padStart(2, '0')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">{t('taskGraph.details.childCount')}:</span>
                        <span>{t('taskGraph.units.itemCount', { count: task.childIds.length })}</span>
                      </div>
                    </div>
                  </div>

                  {/* 父任务信息 */}
                  {task.parentIds && task.parentIds.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t('taskGraph.details.parents')} ({task.parentIds.length})</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {task.parentIds.map(parentId => {
                          const parentTask = taskMap.get(parentId);
                          if (!parentTask) return null;
                          
                          const parentConfig = statusConfig[parentTask.status];
                          const ParentIcon = parentConfig.icon;
                          
                          return (
                            <Button
                              key={parentId}
                              variant="outline"
                              size="sm"
                              className="w-full justify-start h-auto p-2"
                              onClick={() => handleTaskClick(parentId)}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <ParentIcon className="h-4 w-4" />
                                <span className="flex-1 text-left">{parentTask.title}</span>
                                <Badge style={{ backgroundColor: parentConfig.bgColor, color: parentConfig.color }}>
                                  {parentTask.status === TaskStatus.PENDING
                                    ? t('tasks.status.todo')
                                    : parentTask.status === TaskStatus.IN_PROGRESS
                                    ? t('tasks.status.inProgress')
                                    : parentTask.status === TaskStatus.COMPLETED
                                    ? t('tasks.status.done')
                                    : parentTask.status === TaskStatus.BLOCKED
                                    ? t('tasks.status.blocked')
                                    : t('tasks.status.canceled')}
                                </Badge>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 子任务列表 */}
                  {task.childIds.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t('taskGraph.details.children')} ({task.childIds.length})</h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {task.childIds.map(childId => {
                          const childTask = taskMap.get(childId);
                          if (!childTask) return null;
                          
                          const childConfig = statusConfig[childTask.status];
                          const ChildIcon = childConfig.icon;
                          
                          return (
                            <Button
                              key={childId}
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start h-auto p-2"
                              onClick={() => handleTaskClick(childId)}
                            >
                              <div className="flex items-center gap-2 w-full">
                                <ChildIcon className="h-3.5 w-3.5" />
                                <span className="flex-1 text-left">{childTask.title}</span>
                                <Badge style={{ backgroundColor: childConfig.bgColor, color: childConfig.color }}>
                                  {childTask.status === TaskStatus.PENDING
                                    ? t('tasks.status.todo')
                                    : childTask.status === TaskStatus.IN_PROGRESS
                                    ? t('tasks.status.inProgress')
                                    : childTask.status === TaskStatus.COMPLETED
                                    ? t('tasks.status.done')
                                    : childTask.status === TaskStatus.BLOCKED
                                    ? t('tasks.status.blocked')
                                    : t('tasks.status.canceled')}
                                </Badge>
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        if (dialogTaskId) {
                          navigate({ to: `/tasks/${dialogTaskId}` });
                        }
                      }}
                    >
                      {t('tasks.actions.view') || '查看'}
                    </Button>
                    <Button 
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      {t('common.close')}
                    </Button>
                  </div>
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>
        </div>
      </Main>
    </>
  );
};

export default TaskRelationshipGraph;
