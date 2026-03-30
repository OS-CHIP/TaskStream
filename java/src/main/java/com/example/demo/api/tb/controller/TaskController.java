package com.example.demo.api.tb.controller;


import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.baomidou.mybatisplus.core.metadata.IPage;

import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.constant.ProjectConstants;
import com.example.demo.api.tb.domain.Task;
import com.example.demo.api.tb.domain.dto.CreateSubProjectOaDTO;
import com.example.demo.api.tb.domain.dto.TaskCreateDTO;
import com.example.demo.api.tb.domain.dto.TransferTaskDTO;
import com.example.demo.api.tb.domain.dto.UpdateTaskStatusDTO;
import com.example.demo.api.tb.domain.vo.TaskListVO;
import com.example.demo.api.tb.domain.vo.TaskVO;
import com.example.demo.api.tb.service.TaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * (Tasks)表控制层
 *
 * @author ji123
 * @since 2025-02-10 16:18:15
 */
@Validated
@Slf4j
@RestController
@RequestMapping("task")
public class TaskController {
    /**
     * 服务对象
     */
    @Resource
    private TaskService taskService;

    /**
     * 创建任务
     */
    @NotForSuperAdmin
    @PostMapping("createTask")
    public SaResult createTask(@RequestBody @Valid TaskCreateDTO taskCreateDTO) {
        try {
            taskService.createTask(taskCreateDTO);

            return SaResult.ok();
        } catch (BusinessException e) {
            log.warn("创建任务业务异常，参数：{}", taskCreateDTO, e);
            return SaResult.error("创建任务失败：" + e.getMessage());
        } catch (Exception e) {
            log.error("创建任务系统异常，参数：{}", taskCreateDTO, e);
            return SaResult.error("创建任务失败，请稍后重试");
        }
    }


    /**
     * 分页 + 条件查询任务列表
     */
    @PostMapping("/queryTaskPage")
    public SaResult queryTaskPage(
            @RequestParam(required = false) String assigner,
            @RequestParam(required = false) String assignee,
            @RequestParam(required = false) String taskCode,
            @RequestParam(required = false) String taskTitle,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1")
            @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "页面大小必须大于0")
            @Max(value = 100, message = "页面大小不能超过100") Integer pageSize,
            @RequestParam
            @NotBlank(message = "项目ID不能为空")
            @Min(value = 1, message = "项目ID必须大于0") String projectId) {

        log.info("查询任务列表: projectId={}, status={}, priority={}, pageNum={}, pageSize={}",
                projectId, status, priority, pageNum, pageSize);
        try {
            IPage<Task> taskPage = taskService.queryTaskPage(taskCode, taskTitle, status, priority, Long.valueOf(projectId), pageNum, pageSize, assignee, assigner);
            return SaResult.ok("查询成功").setData(taskPage);
        } catch (BusinessException e) {
            log.warn("业务异常: {}", e.getMessage());
            return SaResult.error(e.getMessage()).setCode(e.getCode());
        } catch (Exception e) {
            log.error("查询任务列表失败: projectId={}, status={}, priority={}", projectId, status, priority, e);
            return SaResult.error("查询任务列表失败，请稍后重试").setCode(500);
        }
    }

    /**
     * 查询关于我的task
     */
    @PostMapping("/queryMyTaskPage")
    public SaResult queryMyTaskPage(
            @RequestParam(required = false) String taskCode,
            @RequestParam(required = false) String taskTitle,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "1")
            @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "页面大小必须大于0")
            @Max(value = 100, message = "页面大小不能超过100") Integer pageSize,
            @RequestParam
            @NotBlank(message = "项目ID不能为空")
            @Min(value = 1, message = "项目ID必须大于0") String projectId) {

        log.info("查询任务列表: projectId={}, status={}, priority={}, pageNum={}, pageSize={}",
                projectId, status, priority, pageNum, pageSize);
        try {
            Long userId = StpUtil.getLoginIdAsLong();
            IPage<Task> taskPage = taskService.queryMyTaskPage(taskCode, taskTitle, status, priority, Long.valueOf(projectId), pageNum, pageSize, userId);
            return SaResult.ok("查询成功").setData(taskPage);
        } catch (BusinessException e) {
            log.warn("业务异常: {}", e.getMessage());
            return SaResult.error(e.getMessage()).setCode(e.getCode());
        } catch (Exception e) {
            log.error("查询任务列表失败: projectId={}, status={}, priority={}", projectId, status, priority, e);
            return SaResult.error("查询任务列表失败，请稍后重试").setCode(500);
        }
    }

    /**
     * 删除任务
     */
    @NotForSuperAdmin
    @GetMapping("deleteTask/{tasksId}")
    public SaResult deleteTask(@PathVariable
                               @NotNull(message = "任务ID不能为空")
                               @Min(value = 1, message = "任务ID必须大于0") Long tasksId) {

        log.info("删除任务请求: tasksId={}", tasksId);

        // 参数校验
        if (tasksId == null || tasksId <= 0) {
            return SaResult.error("任务ID无效").setCode(400);
        }

        try {
            // 调用服务层进行删除，权限校验在服务层内完成
            taskService.deleteTaskById(tasksId);

            log.info("任务删除成功: tasksId={}", tasksId);
            return SaResult.ok("任务删除成功");
        } catch (BusinessException e) {
            log.warn("删除任务业务异常: tasksId={}, message={}", tasksId, e.getMessage());
            return SaResult.error(e.getMessage()).setCode(e.getCode());
        } catch (Exception e) {
            log.error("删除任务系统异常: tasksId={}", tasksId, e);
            return SaResult.error("删除任务失败，请稍后重试").setCode(500);
        }
    }

    /**
     * 修改任务
     */
    @NotForSuperAdmin
    @PostMapping("updateTask")
    public SaResult updateTask(@RequestBody TaskCreateDTO taskCreateDTO) {
        try {
            taskService.updateTask(taskCreateDTO);
            log.info("修改任务成功: {}", taskCreateDTO);
            return SaResult.ok();
        } catch (BusinessException e) {
            log.warn("修改任务业务异常: taskId={}, message={}", taskCreateDTO.getId(), e.getMessage(), e);

            return SaResult.error(e.getMessage()).setCode(e.getCode());
        } catch (Exception e) {
            log.error("修改任务系统异常: {}", taskCreateDTO, e);
            return SaResult.error("修改任务失败，请稍后重试").setCode(500);
        }
    }


    /**
     * 通过主键查询单条数据
     *
     * @param tasksId 主键
     * @return 单条数据
     */
    @GetMapping("selectOne/{tasksId}")
    public SaResult selectOne(@PathVariable Long tasksId) {
        // 参数校验
        if (tasksId == null) {
            return SaResult.error("任务ID不能为空");
        }
        TaskVO taskVO = taskService.selectOne(tasksId);

        // 空值检查
        if (taskVO == null) {
            return SaResult.error("未找到对应的任务数据");
        }
        return SaResult.ok().setData(taskVO);

    }


    /**
     * 获取带层级信息的扁平化任务列表   没有了 parentId
     *
     * @return
     */
//    @PostMapping("/getAllTasksWithLevel")
    public SaResult getAllTasksWithLevel(@RequestParam Long taskId) {
        try {
            // 获取带层级信息的扁平化任务列表
            List<TaskVO> tasks = taskService.getAllTasksWithLevel(taskId);
            return SaResult.ok().setData(tasks);
        } catch (Exception e) {
            // 记录异常日志
            log.error("获取任务树形结构失败", e);
            return SaResult.error("获取任务数据失败");
        }
    }

    /**
     * 获取具有多个父级和子级的任务列表
     *
     * @return
     */
    @GetMapping("/getTasksWithMultipleParentsAndChildren/{taskId}")
    public SaResult getTasksWithMultipleParentsAndChildren(@PathVariable Long taskId) {
        try {
            // 获取具有多个父级和子级的任务列表
            TaskListVO tasks = taskService.getTasksWithMultipleParentsAndChildren(taskId);
            return SaResult.ok().setData(tasks);
        } catch (Exception e) {
            // 记录异常日志
            log.error("获取任务树形结构失败", e);
            return SaResult.error("获取任务数据失败");
        }
    }

    /**
     * 获取子任务列表
     * 该接口用于根据父任务ID查询其所有子任务
     *
     * @param parentId 父任务的ID，通过路径变量传递
     * @return 返回SaResult对象，包含子任务列表或错误信息
     * @GetMapping 注解表明这是一个GET请求
     */
    @GetMapping("/getChildrenTasks/{parentId}")
    public SaResult getChildrenTasks(@PathVariable Long parentId) {
        // 参数校验：检查parentId是否为null或小于0
        // 记录警告日志，说明参数无效
        if (parentId == null || parentId < 0) {
            // 返回错误信息
            log.warn("获取子任务列表失败：parentId参数无效，parentId={}", parentId);
            return SaResult.error("parentId参数无效");
        }
        // 调用taskService的getChildrenTasks方法获取子任务列表
        try {
            // 返回成功响应，并设置数据为子任务列表
            List<Task> childrenTasks = taskService.getChildrenTasks(parentId);
            return SaResult.ok().setData(childrenTasks);
            // 捕获异常并记录错误日志
        } catch (Exception e) {
            // 返回错误信息
            log.error("获取子任务列表失败，parentId={}", parentId, e);
            return SaResult.error("获取子任务列表失败");
        }
    }

    /**
     * 通过taskId查询上层父任务列表
     */
    @GetMapping("/getParentTasks/{taskId}")
    public SaResult getParentTasks(@PathVariable Long taskId) {
        // 参数校验
        if (taskId == null || taskId <= 0) {
            return SaResult.error("任务ID参数不合法");
        }

        try {
            List<Task> parentTasks = taskService.getParentTasks(taskId);
            return SaResult.ok().setData(parentTasks);
        } catch (Exception e) {
            // 异常处理
            return SaResult.error("查询父任务列表失败：" + e.getMessage());
        }
    }

    /**
     * 转单给其他成员
     */
    @NotForSuperAdmin
    @PostMapping("/transferTask")
    public SaResult transferTask(@RequestBody @Valid TransferTaskDTO request) {
        try {
            Long loginIdAsLong = StpUtil.getLoginIdAsLong();

            taskService.transferTask(request.getTaskId(), request.getAssignee(),
                    request.getReason(), loginIdAsLong, request.getProjectId());
            return SaResult.ok().setMsg("转单成功");

        } catch (BusinessException e) {
            // 业务异常处理
            return SaResult.error(e.getMessage());
        } catch (Exception e) {
            // 系统异常处理并记录日志
            log.error("转单失败，任务ID: {}, 指派人: {}, 操作人: {}",
                    request.getTaskId(), request.getAssignee(), StpUtil.getLoginIdAsLong(), e);
            return SaResult.error("转单失败");
        }
    }

    /**
     * 查看tag列表
     */
    @GetMapping("/selectTagList/{projectId}")
    public SaResult selectTagList(@PathVariable Long projectId) {
        // 参数验证
        if (projectId == null || projectId <= 0) {
            return SaResult.error("项目ID不能为空且必须大于0");
        }

        try {
            Set<String> tags = taskService.selectTagList(projectId);
            return SaResult.ok().setData(tags);
        } catch (Exception e) {
            // 记录异常日志
            log.error("查询标签列表失败，项目ID: {}", projectId, e);
            return SaResult.error("查询标签列表失败");
        }
    }

    //创建子项目oa单
    @NotForSuperAdmin
    @PostMapping("/createSubProjectOa")
    public SaResult createSubProjectOa(@RequestBody @Valid CreateSubProjectOaDTO createSubProjectOaDTO) {
        taskService.createSubProjectOa(createSubProjectOaDTO);
        return SaResult.ok().setMsg("创建子项目oa单成功");
    }


    /**
     * 甘特图
     */
    @PostMapping("/getGanttData")
    public SaResult getGanttData(@RequestParam(required = false) Long projectId,
                                 @RequestParam(required = false) String startTime,
                                 @RequestParam(required = false) String dueTime) {

        List<Task> tasks = taskService.getGanttData(projectId, startTime, dueTime);
        return SaResult.ok().setData(tasks);
    }


    @NotForSuperAdmin
    @PostMapping("/updateTaskStatus")
    public SaResult updateTaskStatus(@RequestBody UpdateTaskStatusDTO dto) {
        // 参数校验
        if (dto.getTaskId() == null) {
            return SaResult.error("任务ID不能为空");
        }

        try {
            taskService.updateTaskStatus(dto);
            return SaResult.ok("更新成功");
        } catch (BusinessException e) {
            return SaResult.error(e.getMessage());
        } catch (Exception e) {
            return SaResult.error("更新失败：" + e.getMessage());
        }
    }


    /**
     * 动态字段
     *
     SELECT
     t.id AS task_id,
     t.task_title,
     t.status,
     t.priority,
     t.v,
     t.assignee,
     t.create_time,
     t.due_date,
     tt.name AS task_type_name,
     COALESCE(
     JSON_OBJECTAGG(
     tf.name,
     JSON_OBJECT(
     'value', IFNULL(fv.value, ''),
     'label', tf.label,
     'is_required', tf.is_required,
     'options', tf.options,
     'type', tf.type
     )
     ),
     JSON_OBJECT()
     ) AS dynamic_fields
     FROM task t
     INNER JOIN task_type tt ON t.task_type_id = tt.id
     LEFT JOIN task_fields tf
     ON tf.task_type_id = tt.id
     AND tf.name IS NOT NULL
     AND tf.name != ''
     LEFT JOIN field_values fv
     ON fv.tasks_id = t.id
     AND fv.field_id = tf.id
     WHERE t.is_deleted = '0'
     AND t.id = 7
     GROUP BY
     t.id, t.task_title, t.status, t.priority,
     t.assigner, t.assignee, t.create_time, t.due_date, tt.name
     ORDER BY t.create_time DESC;
     *
     *
     */

}

