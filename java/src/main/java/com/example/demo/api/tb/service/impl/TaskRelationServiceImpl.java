package com.example.demo.api.tb.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.domain.TaskRelation;
import com.example.demo.api.tb.mapper.AttachmentMapper;
import com.example.demo.api.tb.mapper.TaskRelationMapper;
import com.example.demo.api.tb.service.AttachmentService;
import com.example.demo.api.tb.service.TaskRelationService;
import io.minio.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * @author ji156
 * @description 针对表【comment】的数据库操作Service实现
 * @createDate 2025-02-10 17:00:07
 */
@Service
@Transactional
@Slf4j
public class TaskRelationServiceImpl extends ServiceImpl<TaskRelationMapper, TaskRelation> implements TaskRelationService {



    @Resource
    private TaskRelationMapper taskRelationMapper;


    /**
     * 检查添加 parent -> child 是否会形成环
     * @return true 表示会形成环（非法）
     */

//    // 2. 遍历父任务，创建关系
//        for (Long parentId : dto.getParentTaskIds()) {
//        // 检测循环依赖
//        if (taskRelationService.wouldCreateCycle(parentId, task.getId())) {
//            throw new IllegalArgumentException("循环依赖！"); // ← 抛出异常
//        }
//
//        TaskRelation rel = new TaskRelation();
//        rel.setParentTaskId(parentId);
//        rel.setChildTaskId(task.getId());
//        taskRelationMapper.insert(rel); // ← 可能部分已插入
//    }
//                          开事务

    public Boolean wouldCreateCycle(Long parentTaskId, Long childTaskId) {
        if (Objects.equals(parentTaskId, childTaskId)) {
            return true; // 自己依赖自己
        }
        Set<Long> visited = new  LinkedHashSet<>();
        return canReach(childTaskId, parentTaskId, visited);
    }

    /**
     * 从 startId 出发，能否到达 targetId（向上查找祖先）
     */
    private boolean canReach(Long startId, Long targetId, Set<Long> visited) {
        if (startId == null || visited.contains(startId)) {
            return false;
        }
        if (startId.equals(targetId)) {
            return true;
        }
        visited.add(startId);

        // 查询 startId 的所有直接父任务（parent_task_id）
        List<TaskRelation> parents = taskRelationMapper.selectList(
                new QueryWrapper<TaskRelation>()
                        .eq("child_task_id", startId)
                        .eq("is_deleted", "0")
        );

        for (TaskRelation rel : parents) {
            if (canReach(rel.getParentTaskId(), targetId, visited)) {
                return true;
            }
        }
        return false;
    }



//    /**
//     * 检测：如果添加 parent → child 的依赖，是否会形成环？
//     */
//    public Boolean wouldCreateCycle(Long parentId, Long childId) {
//        if (parentId == null || childId == null || parentId.equals(childId)) {
//            return true; // 自环
//        }
//        Set<Long> visited = new HashSet<>();
//        return canReachViaChildren(childId, parentId, visited, 0);
//    }
//
//    /**
//     * 从 startId 出发，沿 parent → child 方向（找子任务），能否到达 targetId？
//     * depth 用于防止栈溢出
//     */
//    private boolean canReachViaChildren(Long startId, Long targetId, Set<Long> visited, int depth) {
//        if (depth > 100) return false; // 防止超深递归
//        if (startId == null || visited.contains(startId)) {
//            return false;
//        }
//        if (startId.equals(targetId)) {
//            return true;
//        }
//        visited.add(startId);
//
//        // 查询 startId 的所有直接子任务 ID
//        List<Long> children = taskRelationMapper.selectChildren(startId);
//        for (Long childId : children) {
//            if (canReachViaChildren(childId, targetId, visited, depth + 1)) {
//                return true;
//            }
//        }
//        return false;
//    }

    /**
     * 方案一：验证指定任务列表是否无环（推荐）
     * 适用于：用户选择一批任务，检查它们之间是否有环。
     *
     * 步骤：
     * 输入：List<Integer> taskIds
     * 查询这些任务之间的所有关系（两端都在该列表内）
     * 构建有向图
     * 拓扑排序 or DFS 检测环
     * 无环 → 返回原列表；有环 → 报错或返回空
     * @param taskIds
     * @return
     */

    public List<Long> getAcyclicTaskList(List<Long> taskIds) {
        if (taskIds == null || taskIds.isEmpty()) {
            return taskIds;
        }

        // 1. 查询这些任务之间的所有有效关系（子图边）
        List<TaskRelation> relations = taskRelationMapper.selectRelationsWithinTasks(taskIds);

        // 2. 构建邻接表（child -> parents 或 parent -> children，这里用 parent -> children）
        Map<Long, List<Long>> graph = new HashMap<>();
        Set<Long> allNodes = new HashSet<>(taskIds);

        for (Long id : taskIds) {
            graph.put(id, new ArrayList<>());
        }

        for (TaskRelation r : relations) {
            // 只保留两端都在 taskIds 中的关系
            if (allNodes.contains(r.getParentTaskId()) && allNodes.contains(r.getChildTaskId())) {
                graph.get(r.getParentTaskId()).add(r.getChildTaskId());
            }
        }

        // 3. 拓扑排序检测环
        if (hasCycle(graph, taskIds)) {
            return Collections.emptyList(); // 有环，返回空 或 抛异常
        }

        return new ArrayList<>(taskIds); // 无环，返回原列表
    }

    // 使用 Kahn 算法（拓扑排序）检测环
    private boolean hasCycle(Map<Long, List<Long>> graph, List<Long> nodes) {
        Map<Long, Long> inDegree = new HashMap<>();
        for (Long node : nodes) {
            inDegree.put(node, 0L);
        }

        // 计算入度
        for (Long from : graph.keySet()) {
            for (Long to : graph.get(from)) {
                inDegree.put(to, inDegree.get(to) + 1);
            }
        }

        Queue<Long> queue = new LinkedList<>();
        for (Long node : nodes) {
            if (inDegree.get(node) == 0) {
                queue.offer(node);
            }
        }

        int visitedCount = 0;
        while (!queue.isEmpty()) {
            Long current = queue.poll();
            visitedCount++;

            for (Long neighbor : graph.get(current)) {
                inDegree.put(neighbor, inDegree.get(neighbor) - 1);
                if (inDegree.get(neighbor) == 0) {
                    queue.offer(neighbor);
                }
            }
        }

        return visitedCount != nodes.size(); // 若未访问完，说明有环
    }

}







