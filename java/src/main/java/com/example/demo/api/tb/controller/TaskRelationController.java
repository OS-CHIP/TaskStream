package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.domain.TaskRelation;
import com.example.demo.api.tb.service.TaskRelationService;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import java.util.List;

/**
 * (TaskType)任务关系表
 *
 * @author makejava
 * @since 2025-02-10 16:17:56
 */
@RestController
@RequestMapping("taskRelation")
public class TaskRelationController {


    /**
     * 服务对象
     */
    @Resource
    private TaskRelationService taskRelationService;

    //  测试  有方向无环  只能把所有都写上才可以
    @PostMapping("/validate")
    public SaResult validateDag(@RequestParam List<Long> taskIds) {
        List<Long> acyclic = taskRelationService.getAcyclicTaskList(taskIds);
        if (acyclic.isEmpty() && !taskIds.isEmpty()) {
            return SaResult.error().setMsg("任务列表中存在循环依赖");
        }
        return SaResult.ok().setMsg("任务列表无环").setData(acyclic);
    }

    //   测试  保存新任务的时候 只是防止 不能形成一个环  没有方向
    @PostMapping("/wouldCreateCycle")
    @Transactional
    public SaResult wouldCreateCycle(@RequestParam List<Long> parentTaskIds,
                                     @RequestParam Long childTaskId) {

        // 1. 插入任务（生成 task.id）
        // 2. 遍历父任务，创建关系
        for (Long parentId : parentTaskIds) {
            // 检测循环依赖
            if (taskRelationService.wouldCreateCycle(parentId,childTaskId)) {
                throw new BusinessException("任务 " + childTaskId + " 与任务 " + parentTaskIds + " 之间存在循环依赖");
            }

        // 3 . 插入关系
            TaskRelation taskRelation = new TaskRelation();
            taskRelation.setParentTaskId(parentId);
            taskRelation.setChildTaskId(childTaskId);
            taskRelationService.save(taskRelation);
        }
       return SaResult.ok();
   }












   //更新防环
//   public void updateTaskParents(UpdateTaskParentsDto dto) {
//       Long taskId = dto.getTaskId();
//       List<Long> newParentIds = dto.getNewParentIds() == null ?
//               Collections.emptyList() : dto.getNewParentIds();
//
//       // 1. 校验新父任务是否存在（可选）
//       validateParentTasksExist(newParentIds);
//
//       // 2. 【关键】逐个检测新父任务是否会引发环
//       for (Long parentId : newParentIds) {
//           if (taskRelationService.wouldCreateCycle(parentId, taskId)) {
//               throw new BusinessException(
//                       "无法设置父任务 " + parentId + "：会导致循环依赖（" + taskId + " → ... → " + parentId + "）"
//               );
//           }
//       }
//
//       // 3. 删除当前所有父关系（child_task_id = taskId）
//       taskRelationMapper.delete(
//               new QueryWrapper<TaskRelation>()
//                       .eq("child_task_id", taskId)
//                       .eq("is_deleted", "0")
//       );
//
//       // 4. 插入新的父关系
//       for (Long parentId : newParentIds) {
//           TaskRelation rel = new TaskRelation();
//           rel.setParentTaskId(parentId);
//           rel.setChildTaskId(taskId);
//           rel.setRelationType("DEPENDS_ON");
//           rel.setCreateBy(dto.getOperator());
//           rel.setIsDeleted("0");
//           taskRelationMapper.insert(rel);
//       }
//   }
//
//    private void validateParentTasksExist(List<Long> parentIds) {
//        if (parentIds.isEmpty()) return;
//        List<Long> existingIds = taskMapper.selectBatchIds(parentIds);
//        if (existingIds.size() != parentIds.size()) {
//            throw new BusinessException("部分父任务不存在");
//        }
//    }
}

