package com.example.demo.api.tb.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.constant.ProjectConstants;
import com.example.demo.api.tb.domain.*;
import com.example.demo.api.tb.domain.dto.PriorityDTO;
import com.example.demo.api.tb.domain.dto.StatusDTO;
import com.example.demo.api.tb.domain.dto.TaskCreateDTO;
import com.example.demo.api.tb.domain.dto.TaskOverviewDTO;
import com.example.demo.api.tb.domain.dto.*;
import com.example.demo.api.tb.domain.enums.ApprovalStatus;
import com.example.demo.api.tb.domain.enums.TaskStatus;
import com.example.demo.api.tb.domain.vo.AttachmentVO;
import com.example.demo.api.tb.domain.vo.Dashboard.DashboardData;
import com.example.demo.api.tb.domain.vo.Dashboard.Stats;
import com.example.demo.api.tb.domain.vo.Dashboard.Trend;
import com.example.demo.api.tb.domain.vo.Dashboard.WorkHours;
import com.example.demo.api.tb.domain.vo.TaskListVO;
import com.example.demo.api.tb.domain.vo.TaskVO;
import com.example.demo.api.tb.mapper.*;
import com.example.demo.api.tb.service.*;

import com.example.demo.api.tb.utils.DateUtils;
import com.example.demo.api.tb.utils.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import javax.annotation.Resource;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * @author ji156
 * @description 针对表【tasks】的数据库操作Service实现
 * @createDate 2025-02-10 17:01:22
 */
@Slf4j
@Service
public class TaskServiceImpl extends ServiceImpl<TaskMapper, Task> implements TaskService {
    private static final String CLASS_LOG_PREFIX = "[任务管理]";
    @Value("${minio-prefix}")
    private String minioPrefix;
    @Value("${minio.bucket}")
    private String bucket;


    @Resource
    private TaskMapper taskMapper;
    @Resource
    private UpdateLogMapper updateLogMapper;

    @Resource
    private AttachmentService attachmentService;

    @Resource
    private SerialSequenceService serialSequenceService;

    @Resource
    private TaskTypeTemplateService taskTypeTemplateService;

    @Resource
    private TaskRelationMapper taskRelationMapper;

    @Resource
    private TaskFieldsMapper taskFieldsMapper;

    @Resource
    private TaskFieldValuesService taskFieldValuesService;
    @Autowired
    private TaskFieldValuesMapper taskFieldValuesMapper;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private TaskTypeMapper taskTypeMapper;
    @Resource
    private MessageService messageService;

    @Resource
    private SysUserService userService;

    @Resource
    private RolesService rolesService;


    @Override
    @Transactional(rollbackFor = Exception.class)
    public Task createTask(TaskCreateDTO taskCreateDTO) {
        // 参数校验
        validateTaskCreateDTO(taskCreateDTO);
        try {
            // 转换DTO到Entity
            Task task = new Task();
            BeanUtils.copyProperties(taskCreateDTO, task);

            //  通过任务类型 ID 查询任务类型
            TaskType taskType = taskTypeTemplateService.getTaskType(task.getTaskTypeId());
            if (taskType == null) {
                throw new BusinessException("任务类型不存在");
            }
            String taskTypeName = taskType.getName();

            // 生成编号
            String TaskCode = serialSequenceService.generate("task", taskTypeName, taskCreateDTO.getProjectId());
            task.setTaskCode(TaskCode);

            // 1.保存任务
            taskMapper.insert(task);
            Long taskId = task.getId();
            //操作日志需要
            taskCreateDTO.setId(taskId);
            // 获取该任务类型的自定义字段定义
            List<TaskFields> fieldDefs = taskFieldsMapper.selectList(new LambdaQueryWrapper<TaskFields>().eq(TaskFields::getTaskTypeId, task.getTaskTypeId()));

            // 2.校验必填动态字段 & 保存动态字段
            Map<String, Object> customFields = taskCreateDTO.getCustomFields() != null ? taskCreateDTO.getCustomFields() : new HashMap<>();

            for (TaskFields field : fieldDefs) {
                if (Boolean.TRUE.equals(field.getIsHidden())) continue; // 隐藏字段跳过

                Object value = customFields.get(field.getName());
                String valueStr = value != null ? value.toString() : null;

                // 必填校验
                if (Boolean.TRUE.equals(field.getIsRequired()) && (value == null || valueStr.trim().isEmpty())) {
                    throw new BusinessException("自定义字段 [" + field.getLabel() + "] 为必填项");
                }
                // 保存字段值（即使为空也存，便于后续更新）
                TaskFieldValues fieldValue = new TaskFieldValues();
                fieldValue.setTasksId(taskId);
                fieldValue.setFieldId(field.getId());
                fieldValue.setValue(valueStr); // 简单场景存字符串；复杂结构可存 JSON.toJSONString(value)
                taskFieldValuesService.save(fieldValue);
            }
            // 2. 处理 @ 提及通知
            String content = taskCreateDTO.getDescription();
            Set<String> mentionedUsernames = messageService.parseMentionedUsers(content);
            for (String username : mentionedUsernames) {

                SysUser sysUser = userService.getOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUserName, username));
                if (sysUser == null) {
                    log.warn("用户不存在: {}", username);
                    continue;
                }
                Long mentionedUserId = sysUser.getId();
                long senderId = StpUtil.getLoginIdAsLong();
                if (mentionedUserId != null && !mentionedUserId.equals(senderId)) { // 确保被@的不是自己
                    messageService.createRemind(
                            mentionedUserId, // 被@的用户ID
                            senderId,        // 评论者ID
                            5,               // event_type: 5 = @提及
                            1,               // target_type: 3 = 评论
                            taskId,       // target_id: 评论ID
                            content,         // summary: 评论内容
                            "/task/" + taskId + "#task-" + taskId // jumpUrl: 跳转到任务页面并定位到评论
                    );
                    log.info("发送@提及通知: 评论者ID={}, 被@用户ID={}, 评论ID={}", senderId, mentionedUserId, taskId);
                }
            }

            // 3. 回填附件信息
            if (taskCreateDTO.getAttachmentIds() != null && !taskCreateDTO.getAttachmentIds().trim().isEmpty()) {
                // 获取附件 ID 列表
                List<String> attachmentIdsStr = Arrays.stream(taskCreateDTO.getAttachmentIds().split(","))
                        .map(String::trim)
                        .filter(id -> !id.isEmpty())
                        .toList();
                List<Long> attachmentIds = attachmentIdsStr.stream()
                        .map(Long::parseLong)
                        .toList();
                if (!attachmentIds.isEmpty()) {
                    LambdaUpdateWrapper<Attachment> updateWrapper = new LambdaUpdateWrapper<>();
                    updateWrapper.in(Attachment::getId, attachmentIds)
                            .set(Attachment::getSourceId, taskId);
                    attachmentService.update(updateWrapper);
                    log.info("批量更新附件 sourceId 成功，影响 {} 条", attachmentIdsStr.size());
                }
            }

            //  4.创建父子关系（如果提供了 parentTaskIds）
            if (CollectionUtils.isNotEmpty(taskCreateDTO.getParentTaskIds())) {
                for (Long parentId : taskCreateDTO.getParentTaskIds()) {
                    // 校验父任务是否存在且未删除
                    Task parent = taskMapper.selectById(parentId);
                    if (parent == null) {
                        throw new IllegalArgumentException("父任务不存在或已删除: " + parentId);
                    }

                    TaskRelation relation = new TaskRelation();
                    relation.setParentTaskId(parentId);
                    relation.setChildTaskId(taskId);
                    relation.setRelationType(TaskRelation.TaskRelationType.DEPENDS_ON.getCode());
                    taskRelationMapper.insert(relation);
                }
            }

            return task;
        } catch (IllegalArgumentException e) {
            throw new BusinessException(CLASS_LOG_PREFIX + "参数异常: " + e.getMessage());
        } catch (Exception e) {
            throw new BusinessException(CLASS_LOG_PREFIX + "创建任务失败: " + e.getMessage());
        }
    }

    @Override
    public IPage<Task> queryTaskPage(
            String taskCode,
            String taskTitle,
            String status,
            String priority,
            Long projectId,
            Integer pageNum,
            Integer pageSize,
            String assignee,  // 多选：A,B（仅对 owner 有效）
            String assigner   // 多选：C,D（仅对 owner 有效）
    ) {

        // 构建分页对象
        Page<Task> page = new Page<>(pageNum, pageSize);

        // ==================== 1. 获取当前登录用户 ID ====================
        String loginId = StpUtil.getLoginIdAsString();
        if (StringUtils.isEmpty(loginId)) {
            return new Page<>(pageNum, pageSize); // 未登录，返回空结果
        }

        // ==================== 2. 判断是否为项目拥有者 ====================
        boolean isOwner = false;
        Project project = projectService.getById(projectId);
        if (project != null && project.getOwner() != null && project.getOwner().equals(Long.valueOf(loginId))) {
            isOwner = true;
        }
        // ==================== 2. 判断是否为superadmin ====================
        boolean isSuperAdmin = StpUtil.hasRole(loginId, ProjectConstants.SUPER_ADMIN_ROLE_KEY);
        if (isSuperAdmin) {
            isOwner = true;
        }

        LambdaQueryWrapper<Task> queryWrapper = new LambdaQueryWrapper<>();

        // ==================== 3. 获取项目及所有子项目 ID ====================
        List<Long> projectIds = getAllProjectIds(projectId);

        if (isOwner) {
            // ✅ 拥有者：可查项目树下所有任务，并支持 assignee/assigner 过滤
            queryWrapper.in(Task::getProjectId, projectIds);

            // 🔹 支持多选：assignee = A,B → 转为列表
            if (StringUtils.isNotEmpty(assignee)) {
                List<String> assigneeList = Arrays.stream(assignee.split(","))
                        .map(String::trim)
                        .filter(StringUtils::isNotEmpty)
                        .distinct()
                        .collect(Collectors.toList());
                if (!assigneeList.isEmpty()) {
                    queryWrapper.in(Task::getAssignee, assigneeList);
                }
            }

            // 🔹 支持多选：assigner = A,B → 转为列表
            if (StringUtils.isNotEmpty(assigner)) {
                List<String> assignerList = Arrays.stream(assigner.split(","))
                        .map(String::trim)
                        .filter(StringUtils::isNotEmpty)
                        .distinct()
                        .collect(Collectors.toList());
                if (!assignerList.isEmpty()) {
                    queryWrapper.in(Task::getAssigner, assignerList);
                }
            }

        } else {
            // ❌ 普通用户：只查自己是 assignee 或 assigner 的任务
            // 不允许外部传入 assignee/assigner，强制使用当前用户
            queryWrapper
                    .in(Task::getProjectId, projectIds)
                    .and(wrapper -> wrapper
                            .eq(Task::getAssignee, loginId)
                            .or()
                            .eq(Task::getAssigner, loginId)
                            .or()
                            .apply("FIND_IN_SET({0}, observers) > 0", loginId) // 直接将变量值拼接到SQL中
                    );

        }

        // ==================== 4. 其他通用条件 ====================
        if (StringUtils.isNotEmpty(status)) {
            queryWrapper.eq(Task::getStatus, status);
        }
        if (StringUtils.isNotEmpty(priority)) {
            queryWrapper.eq(Task::getPriority, priority);
        }
        queryWrapper.like(StringUtils.isNotEmpty(taskTitle), Task::getTaskTitle, taskTitle)
                .like(StringUtils.isNotEmpty(taskCode), Task::getTaskCode, taskCode)
                .orderByDesc(Task::getCreateTime);

        return taskMapper.selectPage(page, queryWrapper);
    }

    /**
     * 递归获取项目及其所有子项目（包括孙项目等）
     */
    private List<Long> getAllProjectIds(Long rootProjectId) {
        return projectService.getAllProjectIds(rootProjectId);
//        List<Long> result = new ArrayList<>();
//        Queue<Long> queue = new LinkedList<>();
//        queue.offer(rootProjectId);
//
//        while (!queue.isEmpty()) {
//            Long id = queue.poll();
//            result.add(id);
//
//            // 从数据库查询所有子项目
//            List<Project> children = projectService.list(
//                    new LambdaQueryWrapper<Project>()
//                            .eq(Project::getParentId, id)
//                            .select(Project::getId)
//            );
//            children.forEach(child -> queue.offer(child.getId()));
//        }
//
//        return result;
    }


    @Override
    public IPage<Task> queryMyTaskPage(String taskCode, String taskTitle, String status, String priority, Long projectId, Integer pageNum, Integer pageSize, Long userId) {
        // 构建分页对象
        Page<Task> page = new Page<>(pageNum, pageSize);
        // 构建查询条件
        LambdaQueryWrapper<Task> queryWrapper = new LambdaQueryWrapper<Task>()
                .eq(StringUtils.isNotEmpty(status), Task::getStatus, status)
                .eq(StringUtils.isNotEmpty(priority), Task::getPriority, priority)
                .eq(Task::getProjectId, projectId)
                .and(queryWrapper1 -> queryWrapper1.eq(Task::getAssigner, userId).or().eq(Task::getAssignee, userId))
                .like(StringUtils.isNotEmpty(taskTitle), Task::getTaskTitle, taskTitle)
                .like(StringUtils.isNotEmpty(taskCode), Task::getTaskCode, taskCode)
                .orderByDesc(Task::getCreateTime);
        return taskMapper.selectPage(page, queryWrapper);
    }

    @Override
    public Set<String> selectTagList(Long projectId) {
        return taskMapper.selectList(
                        new LambdaQueryWrapper<Task>()
                                .eq(Task::getProjectId, projectId)
                                .isNotNull(Task::getTags) // 排除 null
                                .ne(Task::getTags, "")    // 排除空字符串
                                .select(Task::getTags)
                )
                .stream()
                .map(Task::getTags)
                .flatMap(tags -> Arrays.stream(tags.split(",")))
                .map(String::trim) // 去除可能的空格（如 "tag1, tag2"）
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toCollection(HashSet::new));
    }

    @Override
    @Transactional
    public void createSubProjectOa(CreateSubProjectOaDTO createSubProjectOaDTO) {
        Project project = projectService.getOne(new LambdaQueryWrapper<Project>().eq(Project::getId, createSubProjectOaDTO.getProjectParentId()));
        if (project == null) {
            throw new BusinessException("项目不存在");
        }

        String owner = String.valueOf(project.getOwner());
        String loginIdAsString = StpUtil.getLoginIdAsString();
        TaskType taskType = taskTypeMapper.selectOne(new LambdaQueryWrapper<TaskType>().eq(TaskType::getName, "projectApproval"));
        Long taskTypeId = taskType.getId();
        Task task = new Task();
        //生成任务编号
        String generate = serialSequenceService.generate("task", "projectApproval", createSubProjectOaDTO.getProjectParentId());
        task.setTaskCode(generate);
        task.setTaskTitle(createSubProjectOaDTO.getProjectName());
        task.setTags("system");
        task.setAssigner(createSubProjectOaDTO.getInitiator() == null ? loginIdAsString : createSubProjectOaDTO.getInitiator());
        task.setAssignee(String.valueOf(owner));
        task.setDescription(createSubProjectOaDTO.getDescription());
        task.setTaskTypeId(taskTypeId);
        task.setStartTime(createSubProjectOaDTO.getStartTime());
        task.setDueDate(createSubProjectOaDTO.getDueDate());
        task.setProjectId(createSubProjectOaDTO.getProjectParentId());
        task.setPriority(createSubProjectOaDTO.getPriority());
        task.setStatus(String.valueOf(ApprovalStatus.PENDING.getCode()));
        taskMapper.insert(task);
        //发起人
        String initiator = loginIdAsString;
        //审批人
        String approver = owner;
        String projectDescription = createSubProjectOaDTO.getProjectDescription();

        // 1. 准备数据
        HashMap<String, Object> fieldValues = new HashMap<>();
        fieldValues.put("initiator", initiator);
        fieldValues.put("approver", approver);
        fieldValues.put("projectSubId", createSubProjectOaDTO.getProjectSubId() != null ? createSubProjectOaDTO.getProjectSubId() : null);
        fieldValues.put("projectDescription", projectDescription);

        // 2. 根据 taskTypeId 查询所有字段定义
        List<TaskFields> taskFields = taskFieldsMapper.selectList(
                new LambdaQueryWrapper<TaskFields>().eq(TaskFields::getTaskTypeId, taskTypeId)
        );

        // 3. 遍历字段，为每个字段创建任务值记录
        for (TaskFields taskField : taskFields) {
            String fieldName = taskField.getName(); // 如 "initiator"
            Object value = fieldValues.get(fieldName);   // 从 map 取值

            // 4. 若字段不存在或值为空，可跳过或设默认值
            if (value == null) {
                log.warn("Field '{}' has no value for taskTypeId={}", fieldName, taskTypeId);
                continue;
            }

            // 5. 构建任务字段值
            TaskFieldValues taskFieldValues = new TaskFieldValues();
            taskFieldValues.setTasksId(task.getId());          // 任务 ID
            taskFieldValues.setFieldId(taskField.getId());     // 字段 ID
            taskFieldValues.setValue(value.toString());        // 设置值（转字符串）
            taskFieldValuesMapper.insert(taskFieldValues);     // 插入数据库
        }
    }

    @Override
    public List<Task> getGanttData(Long projectId, String startTime, String dueTime) {

        // ==================== 1. 获取当前登录用户 ID ====================
        String loginId = StpUtil.getLoginIdAsString();


        // ==================== 2. 判断是否为项目拥有者 ====================
        boolean isOwner = false;
        Project project = projectService.getById(projectId);
        if (project != null && project.getOwner() != null && project.getOwner().equals(Long.valueOf(loginId))) {
            isOwner = true;
        }

        // ==================== 2. 判断是否为superadmin ====================
        boolean isSuperAdmin = StpUtil.hasRole(loginId, ProjectConstants.SUPER_ADMIN_ROLE_KEY);
        if (isSuperAdmin) {
            isOwner = true;
        }

        LambdaQueryWrapper<Task> queryWrapper = new LambdaQueryWrapper<>();

        // ==================== 3. 获取项目及所有子项目 ID ====================
        List<Long> projectIds = getAllProjectIds(projectId);

        if (isOwner) {
            // ✅ 拥有者：可查项目树下所有任务，并支持 assignee/assigner 过滤
            queryWrapper.in(Task::getProjectId, projectIds);


        } else {
            //  普通用户：只查自己是 assignee 或 assigner 的任务
            // 不允许外部传入 assignee/assigner，强制使用当前用户
            queryWrapper
                    .in(Task::getProjectId, projectIds)
                    .and(wrapper -> wrapper
                            .eq(Task::getAssignee, loginId)
                            .or()
                            .eq(Task::getAssigner, loginId)
                    );
        }

//        List<Long> projectIds = getAllProjectIds(projectId);
//        // 不允许外部传入 assignee/assigner，强制使用当前用户
//        queryWrapper
//                .in(Task::getProjectId, projectIds)
//                .and(wrapper -> wrapper
//                        .eq(Task::getAssignee, loginId)
//                        .or()
//                        .eq(Task::getAssigner, loginId)
//                );


        // ==================== 4. 时间范围筛选 ====================
        // 🔹  startTime < 结束时间
        if (StringUtils.isNotEmpty(startTime)) {
            try {

                Date start = DateUtils.parseDate(startTime, "yyyy-MM-dd HH:mm:ss");
                queryWrapper.ge(Task::getDueDate, start);
            } catch (Exception e) {
                log.warn("Invalid startTime format: {}", startTime);
            }
        }

        // 🔹  dueTime > 开始时间
        if (StringUtils.isNotEmpty(dueTime)) {
            try {
                Date end = DateUtils.parseDate(dueTime, "yyyy-MM-dd HH:mm:ss");
                queryWrapper.le(Task::getStartTime, end);
            } catch (Exception e) {
                log.warn("Invalid dueTime format: {}", dueTime);
            }
        }

        // ==================== 5. 其他通用条件（可扩展）====================
        queryWrapper.orderByAsc(Task::getStartTime);
        return taskMapper.selectList(queryWrapper);
    }

    @Transactional
    @Override
    public void updateTaskStatus(UpdateTaskStatusDTO dto) {

        String loginIdAsString = StpUtil.getLoginIdAsString();
        // 3. 查询原始任务
        Task oldTask = taskMapper.selectById(dto.getTaskId());
        if (oldTask == null) {
            throw new BusinessException("任务不存在");
        }


        // ==================== ：检查参与者权限 ====================
        // 将 observers 字符串转换为集合，用于快速查找
        List<String> observerList = StrUtil.split(oldTask.getObservers(), ','); // 使用 Hutool 的 StrUtil
        boolean isObserver = CollUtil.contains(observerList, loginIdAsString); // 使用 Hutool 的 CollUtil

        if (isObserver) {
            throw new BusinessException("参与者无权修改任务信息");
        }
        boolean isAssigner = loginIdAsString.equals(oldTask.getAssigner());
        boolean isAssignee = loginIdAsString.equals(oldTask.getAssignee());

        // ✅ 特殊情况：指派者与执行者为同一人，拥有全部权限
        boolean isOwner = isAssigner && isAssignee;


        Task task = new Task();
        task.setId(dto.getTaskId());
        task.setCompletionPercentage(dto.getCompletionPercentage());

        // 7. 特殊处理：status 字段
        if (dto.getStatus() != null &&
                !dto.getStatus().equals(oldTask.getStatus())) {

            // 权限校验：如果不是自己，且不是指派者或执行者，则无权修改
            if (!isOwner && !isAssigner && !isAssignee) {
                throw new BusinessException("您无权修改此任务");
            }

            // ✅ 如果是同一个人，直接允许修改，无需限制
            if (isOwner) {
                // 无需额外校验，直接允许所有状态变更
                // 记录日志，“任务负责人自行调整状态”
            }
            // 否则，按原规则校验
            else if (isAssignee) {
                // 执行人只能改 1, 2, 5
                if (!String.valueOf(TaskStatus.PENDING.getCode()).equals(dto.getStatus()) &&
                        !String.valueOf(TaskStatus.IN_PROGRESS.getCode()).equals(dto.getStatus()) &&
                        !String.valueOf(TaskStatus.PENDING_REVIEW.getCode()).equals(dto.getStatus()) &&
                        !String.valueOf(TaskStatus.BLOCKED.getCode()).equals(dto.getStatus())) {
                    throw new BusinessException("执行人只能将任务设为：待开始、进行中、已阻塞");
                }
            } else if (isAssigner) {
                // 指派人只能改 3, 4
                if (!String.valueOf(TaskStatus.COMPLETED.getCode()).equals(dto.getStatus()) &&
                        !String.valueOf(TaskStatus.CANCELLED.getCode()).equals(dto.getStatus())) {
                    throw new BusinessException("指派人只能将任务设为“已完成”或“已取消”");
                }
            }

            // 设置完成时间（仅当变为“已完成”）
            if (String.valueOf(TaskStatus.COMPLETED.getCode()).equals(dto.getStatus()) || String.valueOf(TaskStatus.PENDING_REVIEW.getCode()).equals(dto.getStatus())) {
                task.setCompletionPercentage("100");
                task.setActualFinishTime(new Date());
            }

            // 更新状态
            task.setStatus(dto.getStatus());
        }

        taskMapper.updateById(task);


    }

    @Override
    @Transactional
    public void deleteTaskById(Long taskId) {
        if (taskId == null || taskId <= 0) {
            throw new BusinessException("任务ID无效");
        }

        // 1. 查询任务是否存在
        Task task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }

        // 2. ==================== 权限检查：只有 assigner 和 superadmin 可以删除任务 ====================
        String currentLoginId = StpUtil.getLoginIdAsString();

        // 检查当前用户是否为超级管理员
        boolean isSuperAdmin = StpUtil.hasRole(ProjectConstants.SUPER_ADMIN_ROLE_KEY);

        boolean isAssigner = currentLoginId.equals(task.getAssigner());

        if (!isSuperAdmin && !isAssigner) {
            throw new BusinessException("您无权删除此任务，只有任务发起人才能删除。");
        }

        // 3. 权限检查通过，执行删除操作
        // 删除任务主记录
        taskMapper.deleteById(taskId);

        // 可选：级联删除相关的附件、自定义字段值等
        // attachmentService.remove(new LambdaQueryWrapper<Attachment>().eq(Attachment::getSourceId, taskId));
        // taskFieldValuesService.remove(new LambdaQueryWrapper<TaskFieldValues>().eq(TaskFieldValues::getTasksId, taskId));
    }



    @Override
    @Transactional
    public void updateTask(TaskCreateDTO taskCreateDTO) {
        // 参数校验
        if (taskCreateDTO == null) {
            throw new BusinessException("任务对象不能为空");
        }

        if (taskCreateDTO.getId() == null) {
            throw new BusinessException("任务ID不能为空");
        }
        String loginIdAsString = StpUtil.getLoginIdAsString();

        // 1.执行更新操作
        try {
            // 3. 查询原始任务
            Task oldTask = taskMapper.selectById(taskCreateDTO.getId());
            if (oldTask == null) {
                throw new BusinessException("任务不存在");
            }

            // ==================== 权限检查：只有 assigner 和 superadmin 可以修改任务信息 ====================
            // 检查当前用户是否为超级管理员
            boolean isSuperAdmin = StpUtil.hasRole(ProjectConstants.SUPER_ADMIN_ROLE_KEY);

            boolean isAssigner = loginIdAsString.equals(oldTask.getAssigner());
            boolean isAssignee = loginIdAsString.equals(oldTask.getAssignee());

            // ✅ 特殊情况：指派者与执行者为同一人，拥有全部权限
            boolean isOwner = isAssigner && isAssignee;

            // 核心权限判断：只有 superadmin, assigner, 或者 assigner==assignee 的用户才能修改
            if (!isSuperAdmin && !isAssigner) {
                throw new BusinessException("您无权修改此任务信息，只有任务发起人才能修改。");
            }

            // 注意：由于上面的权限检查已经足够，下面这段关于 observer 的检查可以移除，
            // 因为 observer 不满足 (!isSuperAdmin && !isAssigner && !isOwner) 的条件，早已被拒绝。
        /*
        List<String> observerList = StrUtil.split(oldTask.getObservers(), ',');
        boolean isObserver = CollUtil.contains(observerList, loginIdAsString);
        if (isObserver) {
            throw new BusinessException("参与者无权修改任务信息");
        }
        */

            Task task = new Task();
            BeanUtil.copyProperties(taskCreateDTO, task);

            // 7. 特殊处理：status 字段
            // (状态修改的权限逻辑可以根据您的最终业务规则进行调整)
            // 例如，如果您认为即使是 assigner 也不能随意修改状态，可以保留或修改这部分逻辑
//            if (taskCreateDTO.getStatus() != null &&
//                    !taskCreateDTO.getStatus().equals(oldTask.getStatus())) {
//
//                // 如果是同一个人，直接允许修改，无需限制
//                if (isOwner) {
//                    // 无需额外校验，直接允许所有状态变更
//                    // 记录日志，“任务负责人自行调整状态”
//                }
//                // 否则，按原规则校验（assigner 有更多权限）
//                else if (isAssigner) { // assigner (发起人) 可以修改状态
//                    // assigner 可以将任务设为任意状态，或者您也可以在这里加一些限制
//                    // 例如，不允许从“已完成”改为“待开始”等。
//                }
//                // assignee (负责人) 在新规则下没有修改任务信息的权限，所以这块逻辑不会走到
//                else if (isAssignee) {
//                    // 如果未来需要给 assignee 修改状态的权限，可以在这里定义
//                    // 但现在，由于权限检查，assignee 不会到达这里
//                }
//
//                // 设置完成时间（仅当变为“已完成”）
//                if (String.valueOf(TaskStatus.COMPLETED.getCode()).equals(taskCreateDTO.getStatus())) {
//                    task.setActualFinishTime(new Date());
//                }
//
//                // 更新状态
//                task.setStatus(taskCreateDTO.getStatus());
//            }

            taskMapper.updateById(task);

            // 更新附件
            // (附件更新逻辑保持不变)
            if (taskCreateDTO.getAttachmentIds() != null && !taskCreateDTO.getAttachmentIds().trim().isEmpty()) {
                List<Long> ids = Arrays.stream(taskCreateDTO.getAttachmentIds().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(Long::parseLong)
                        .collect(Collectors.toList());
                attachmentService.updateAttachments(taskCreateDTO.getId(), ids, "task");
            }

            // 2.更新自定义字段值
            // (自定义字段更新逻辑保持不变)
            task.setTaskTypeId(oldTask.getTaskTypeId());
            List<TaskFields> fieldDefs = taskFieldsMapper.selectList(new LambdaQueryWrapper<TaskFields>().eq(TaskFields::getTaskTypeId, task.getTaskTypeId()));
            Map<String, Object> customFields = taskCreateDTO.getCustomFields() != null ? taskCreateDTO.getCustomFields() : new HashMap<>();

            for (TaskFields field : fieldDefs) {
                if (Boolean.TRUE.equals(field.getIsHidden())) continue;

                Object value = customFields.get(field.getName());
                String valueStr = value != null ? value.toString() : null;

                if (Boolean.TRUE.equals(field.getIsRequired()) && (value == null || valueStr.trim().isEmpty())) {
                    throw new BusinessException("自定义字段 [" + field.getLabel() + "] 为必填项");
                }

                TaskFieldValues fieldValue = new TaskFieldValues();
                fieldValue.setValue(valueStr);

                TaskFieldValues existingFieldValue = taskFieldValuesService.getOne(
                        new LambdaQueryWrapper<TaskFieldValues>()
                                .eq(TaskFieldValues::getTasksId, taskCreateDTO.getId())
                                .eq(TaskFieldValues::getFieldId, field.getId())
                );

                if (existingFieldValue != null) {
                    existingFieldValue.setValue(valueStr);
                    taskFieldValuesService.updateById(existingFieldValue);
                } else {
                    if (value != null && valueStr.trim().length() > 0) {
                        TaskFieldValues newFieldValue = new TaskFieldValues();
                        newFieldValue.setTasksId(taskCreateDTO.getId());
                        newFieldValue.setFieldId(field.getId());
                        newFieldValue.setValue(valueStr);
                        taskFieldValuesService.save(newFieldValue);
                    }
                }
            }

            // 处理父子关系（单父）
            if (taskCreateDTO.getParentTaskIds() != null && !taskCreateDTO.getParentTaskIds().isEmpty()) {
                this.handleParentChildRelation(taskCreateDTO.getId(), taskCreateDTO.getParentTaskIds().get(0));
            }

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("更新任务失败: " + e.getMessage(), e);
        }
    }

//    @Override
//    @Transactional
//    public void updateTask(TaskCreateDTO taskCreateDTO) {
//        // 参数校验
//        if (taskCreateDTO == null) {
//            throw new BusinessException("任务对象不能为空");
//        }
//
//        if (taskCreateDTO.getId() == null) {
//            throw new BusinessException("任务ID不能为空");
//        }
//        String loginIdAsString = StpUtil.getLoginIdAsString();
//
//
//        // 1.执行更新操作
//        try {
//            // 3. 查询原始任务
//            Task oldTask = taskMapper.selectById(taskCreateDTO.getId());
//            if (oldTask == null) {
//                throw new BusinessException("任务不存在");
//            }
//
//
//            // ==================== ：检查参与者权限 ====================
//            // 将 observers 字符串转换为集合，用于快速查找
//            List<String> observerList = StrUtil.split(oldTask.getObservers(), ','); // 使用 Hutool 的 StrUtil
//            boolean isObserver = CollUtil.contains(observerList, loginIdAsString); // 使用 Hutool 的 CollUtil
//
//            if (isObserver) {
//                throw new BusinessException("参与者无权修改任务信息");
//            }
//
//            boolean isAssigner = loginIdAsString.equals(oldTask.getAssigner());
//            boolean isAssignee = loginIdAsString.equals(oldTask.getAssignee());
//
//            // ✅ 特殊情况：指派者与执行者为同一人，拥有全部权限
//            boolean isOwner = isAssigner && isAssignee;
//
//            Task task = new Task();
//            BeanUtil.copyProperties(taskCreateDTO, task);
//
//            // 7. 特殊处理：status 字段
//            if (taskCreateDTO.getStatus() != null &&
//                    !taskCreateDTO.getStatus().equals(oldTask.getStatus())) {
//
//                // 权限校验：如果不是自己，且不是指派者或执行者，则无权修改
//                if (!isOwner && !isAssigner && !isAssignee) {
//                    throw new BusinessException("您无权修改此任务");
//                }
//
//                // ✅ 如果是同一个人，直接允许修改，无需限制
//                if (isOwner) {
//                    // 无需额外校验，直接允许所有状态变更
//                    // 记录日志，“任务负责人自行调整状态”
//                }
//                // 否则，按原规则校验
//                else if (isAssignee) {
//                    // 执行人只能改 1, 2, 5
//                    if (!String.valueOf(TaskStatus.PENDING.getCode()).equals(taskCreateDTO.getStatus()) &&
//                            !String.valueOf(TaskStatus.IN_PROGRESS.getCode()).equals(taskCreateDTO.getStatus()) &&
//                            !String.valueOf(TaskStatus.BLOCKED.getCode()).equals(taskCreateDTO.getStatus())) {
//                        throw new BusinessException("执行人只能将任务设为：待开始、进行中、已阻塞");
//                    }
//                } else if (isAssigner) {
//                    // 指派人只能改 3, 4
//                    if (!String.valueOf(TaskStatus.COMPLETED.getCode()).equals(taskCreateDTO.getStatus()) &&
//                            !String.valueOf(TaskStatus.CANCELLED.getCode()).equals(taskCreateDTO.getStatus())) {
//                        throw new BusinessException("指派人只能将任务设为“已完成”或“已取消”");
//                    }
//                }
//
//                // 设置完成时间（仅当变为“已完成”）
//                if (String.valueOf(TaskStatus.COMPLETED.getCode()).equals(taskCreateDTO.getStatus())) {
//                    task.setActualFinishTime(new Date());
//                }
//
//                // 更新状态
//                task.setStatus(taskCreateDTO.getStatus());
//            }
//
//            taskMapper.updateById(task);
//
//
//            // 更新附件
//            //查看附件是否被修改
//
//            if (taskCreateDTO.getAttachmentIds() != null && !taskCreateDTO.getAttachmentIds().trim().isEmpty()) {
//                List<Long> ids = Arrays.stream(taskCreateDTO.getAttachmentIds().split(","))
//                        .map(String::trim)
//                        .filter(s -> !s.isEmpty())
//                        .map(Long::parseLong)
//                        .collect(Collectors.toList());
//                attachmentService.updateAttachments(taskCreateDTO.getId(), ids, "task");
//
//            }
//
//
//            //2.更新自定义字段值
//            // 校验必填动态字段 & 保存动态字段
//            task.setTaskTypeId(oldTask.getTaskTypeId());
//            // 获取该任务类型的自定义字段定义
//            List<TaskFields> fieldDefs = taskFieldsMapper.selectList(new LambdaQueryWrapper<TaskFields>().eq(TaskFields::getTaskTypeId, task.getTaskTypeId()));
//
//            Map<String, Object> customFields = taskCreateDTO.getCustomFields() != null ? taskCreateDTO.getCustomFields() : new HashMap<>();
//
//            for (TaskFields field : fieldDefs) {
//                if (Boolean.TRUE.equals(field.getIsHidden())) continue; // 隐藏字段跳过
//
//                Object value = customFields.get(field.getName());
//                String valueStr = value != null ? value.toString() : null;
//
//                // 必填校验
//                if (Boolean.TRUE.equals(field.getIsRequired()) && (value == null || valueStr.trim().isEmpty())) {
//                    throw new BusinessException("自定义字段 [" + field.getLabel() + "] 为必填项");
//                }
//                // 保存字段值（即使为空也存，便于后续更新）
//                TaskFieldValues fieldValue = new TaskFieldValues();
//                fieldValue.setValue(valueStr); // 简单场景存字符串；复杂结构可存 JSON.toJSONString(value)
//                //更新value字段条件是任务ID和字段ID
//                TaskFieldValues existingFieldValue = taskFieldValuesService.getOne(
//                        new LambdaQueryWrapper<TaskFieldValues>()
//                                .eq(TaskFieldValues::getTasksId, taskCreateDTO.getId())
//                                .eq(TaskFieldValues::getFieldId, field.getId())
//                );
//                if (existingFieldValue != null) {
//                    // 如果记录存在，则更新value字段
//                    existingFieldValue.setValue(valueStr);
//                    taskFieldValuesService.updateById(existingFieldValue);
//                } else {
//                    // 记录不存在，且当前有值，需要创建新记录
//                    if (value != null && valueStr.trim().length() > 0) {
//                        TaskFieldValues newFieldValue = new TaskFieldValues();
//                        newFieldValue.setTasksId(taskCreateDTO.getId());
//                        newFieldValue.setFieldId(field.getId());
//                        newFieldValue.setValue(valueStr);
//                        taskFieldValuesService.save(newFieldValue); // 新增
//                    }
//                }
//            }
//
//
//            // 处理父子关系（单父）
//            if (taskCreateDTO.getParentTaskIds() != null && !taskCreateDTO.getParentTaskIds().isEmpty()) {
//
//                this.handleParentChildRelation(taskCreateDTO.getId(), taskCreateDTO.getParentTaskIds().get(0));
//            }
//
//        } catch (BusinessException e) {
//            throw e;
//        } catch (Exception e) {
//            // 记录异常日志并重新抛出
//            throw new RuntimeException("更新任务失败: " + e.getMessage(), e);
//        }
//    }

    private void handleParentChildRelation(Long taskId, Long parentId) {

        // 判断parentId是否被修改
        TaskRelation taskRelation = taskRelationMapper.selectOne(new LambdaQueryWrapper<TaskRelation>().eq(TaskRelation::getChildTaskId, taskId));
        if (taskRelation != null && taskRelation.getParentTaskId().equals(parentId)) {
            return;
        }
        // 检查是否存在环路（不能把子任务设为父任务）
        if (isDescendant(taskId, parentId)) {
            throw new BusinessException("不能将子任务设置为父任务，会形成循环依赖");
        }

        // 删除旧的父子关系（确保只有一个父任务）
        taskRelationMapper.delete(new LambdaQueryWrapper<TaskRelation>().eq(TaskRelation::getChildTaskId, taskId));

        // 插入新的父子关系
        TaskRelation relation = new TaskRelation();
        relation.setParentTaskId(parentId);
        relation.setChildTaskId(taskId);
        relation.setRelationType(TaskRelation.TaskRelationType.DEPENDS_ON.getCode()); // 可选，表示单父关系
        taskRelationMapper.insert(relation);
    }

    private boolean isDescendant(Long ancestorId, Long descendantId) {
        if (ancestorId.equals(descendantId)) {
            return true;
        }
        // 查找所有以 ancestorId 为根的子树节点
        List<Long> descendants = taskRelationMapper.findDescendants(ancestorId);
        return descendants.contains(descendantId);
    }

    @Override
    public List<TaskVO> getAllTasksWithLevel(Long taskId) {
        return taskMapper.getAllTasksWithLevel(taskId);
    }

    @Override
    public List<Task> getChildrenTasks(Long parentId) {


        // 查询未删除的子任务并按创建时间升序排列
        List<Task> tasks = taskMapper.getChildrenTasks(parentId);
        // 确保返回空集合而不是null
        return tasks != null ? tasks : new ArrayList<>();
    }


    @Override
    public TaskListVO getTasksWithMultipleParentsAndChildren(Long taskId) {
        // 1. 检查任务是否存在
        Task root = taskMapper.selectById(taskId);
        if (root == null) {
            throw new RuntimeException("任务不存在或已删除");
        }

        // 2. 查询所有相关任务和关系
        List<Task> tasks = taskRelationMapper.selectAllRelatedTasks(taskId);
        List<TaskRelation> relations = taskRelationMapper.selectAllRelatedRelations(taskId);

        TaskListVO taskListVO = new TaskListVO();
        taskListVO.setTasks(tasks);
        taskListVO.setRelations(relations);
        return taskListVO;
    }

    @Override
    public List<Task> getParentTasks(Long taskId) {
        if (taskId == null) {
            return new ArrayList<>();
        }

        try {
            List<Task> parentTasks = taskMapper.selectParentTasks(taskId);
            return parentTasks != null ? parentTasks : new ArrayList<>();
        } catch (Exception e) {
            // 记录异常日志
            throw new RuntimeException("获取父任务列表失败，taskId: " + taskId, e);
        }
    }


    @Override
    @Transactional
    public void transferTask(Long taskId, String newAssignee, String reason, Long loginId, Long projectId) {

        // 1. 查询原任务
        Task originalTask = taskMapper.selectById(taskId);
        if (originalTask == null) {
            throw new BusinessException("任务不存在或已删除");
        }
        // ==================== ：检查参与者权限 ====================
        // 将 observers 字符串转换为集合，用于快速查找
        List<String> observerList = StrUtil.split(originalTask.getObservers(), ','); // 使用 Hutool 的 StrUtil
        boolean isObserver = CollUtil.contains(observerList, loginId.toString()); // 使用 Hutool 的 CollUtil

        if (isObserver) {
            throw new BusinessException("参与者无权修改任务信息");
        }

        String oldAssigner = originalTask.getAssigner();
        if (oldAssigner.equals(loginId.toString())) {
            throw new BusinessException("assigner不能转单");
        }
        //是否是叶子节点
        if (taskRelationMapper.isLeafNode(taskId)) {
            throw new BusinessException("只能对叶子任务进行转单，请先处理子任务");
        }
        // 2.
        if (newAssignee == null || newAssignee.trim().isEmpty()) {
            throw new BusinessException("请选择转单成员");
        }

        if (newAssignee.equals(loginId.toString())) {
            throw new BusinessException("转单成员不能与原成员相同");
        }


        // 4.通过任务类型 ID 查询任务类型
        TaskType taskType = taskTypeTemplateService.getTaskType(originalTask.getTaskTypeId());
        if (taskType == null) {
            throw new BusinessException("任务类型不存在");
        }
        // 生成编号
        String taskTypeName = taskType.getName();
        String newTaskCode = serialSequenceService.generate("task", taskTypeName, projectId);

        // 5. 保存新任务
        Task newTask = new Task();
        BeanUtil.copyProperties(originalTask, newTask);
        newTask.setId(null);
        newTask.setTaskCode(newTaskCode);
        newTask.setTaskTitle("(转) " + originalTask.getTaskTitle());
        newTask.setAssignee(newAssignee);
        newTask.setAssigner(String.valueOf(loginId));
        taskMapper.insert(newTask);

        //6. 保存自定义字段
        List<TaskFieldValues> taskFieldValues = taskFieldValuesMapper.selectList(new LambdaQueryWrapper<TaskFieldValues>().eq(TaskFieldValues::getTasksId, originalTask.getId()));

        taskFieldValues.forEach(taskFieldValue -> {
            taskFieldValue.setId(null);
            taskFieldValue.setTasksId(newTask.getId());
            taskFieldValuesMapper.insert(taskFieldValue);
        });

        //7. 保存父子关系

        TaskRelation relation = new TaskRelation();
        relation.setParentTaskId(taskId);
        relation.setChildTaskId(newTask.getId());
        relation.setRelationType(TaskRelation.TaskRelationType.TRANSFER.getCode());
        taskRelationMapper.insert(relation);

        // 附件
        LambdaQueryWrapper<Attachment> queryWrapper = new LambdaQueryWrapper<Attachment>().eq(Attachment::getSourceId, taskId).eq(Attachment::getSourceType, "task");
        List<Attachment> attachmentList = attachmentService.list(queryWrapper);
        attachmentList.stream().forEach(attachment -> {
            attachment.setId(null);
            attachment.setSourceId(newTask.getId());
            attachmentService.save(attachment);
        });

        // 8. 写入 update_log 表

        UpdateLog log = new UpdateLog();
        log.setTableName("task");
        log.setRecordId(newTask.getId());
        log.setOperationType(UpdateLog.OperationType.TRANSFER);
        updateLogMapper.insert(log);


    }

    @Override
    public TaskVO selectOne(Long tasksId) {

        //通过任务查询任务
        TaskVO task = taskMapper.selectTaskDetailById(tasksId);

        if (task == null) {
            throw new BusinessException(410, "任务不存在或已删除");
        }


        // 2. ==================== 权限检查：仅允许 superadmin, assigner, assignee, observers 查看 ====================
        String currentLoginId = StpUtil.getLoginIdAsString();

        // 检查当前用户是否为超级管理员
        boolean isSuperAdmin = StpUtil.hasRole(ProjectConstants.SUPER_ADMIN_ROLE_KEY);

        // 检查当前用户是否是 assigner (发起人)
        boolean isAssigner = currentLoginId.equals(task.getAssigner());
        // 检查当前用户是否是 assignee (负责人)
        boolean isAssignee = currentLoginId.equals(task.getAssignee());

        // 检查当前用户是否是 observers (观察者) 中的一员
        List<String> observerList = StrUtil.split(task.getObservers(), ',');
        boolean isObserver = CollUtil.contains(observerList, currentLoginId);

        // 如果当前用户不是 superadmin，且不是发起人、负责人、也不是观察者，则禁止访问
        if (!isSuperAdmin && !isAssigner && !isAssignee && !isObserver) {
            throw new BusinessException(410, "您无权查看此任务的详细信息。");
        }


        List<Attachment> attachments = attachmentService.list(new LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getSourceId, tasksId)
                .eq(Attachment::getSourceType, "task"));

        TaskVO taskVO = new TaskVO();
        BeanUtil.copyProperties(task, taskVO);

        if (attachments != null && !attachments.isEmpty()) {
            List<AttachmentVO> attachmentVOs = new ArrayList<>();
            for (Attachment attachment : attachments) {
                AttachmentVO attachmentVO = new AttachmentVO();
                BeanUtil.copyProperties(attachment, attachmentVO);
                attachmentVO.setUrl(minioPrefix + "/" + bucket + "/" + attachment.getFilePath());
                attachmentVOs.add(attachmentVO);
            }
            taskVO.setAttachments(attachmentVOs);
        }

        return taskVO;
    }


    /**
     * 验证任务创建参数
     *
     * @param taskCreateDTO 任务创建参数
     */
    private void validateTaskCreateDTO(TaskCreateDTO taskCreateDTO) {
        if (taskCreateDTO == null) {
            throw new BusinessException("任务参数不能为空");
        }

        // 验证截止时间是否合理
        if (taskCreateDTO.getDueDate() != null && taskCreateDTO.getDueDate().before(new Date())) {
            throw new BusinessException("截止时间不能早于当前时间");
        }
    }

    public TaskOverviewDTO getOverViewByProjectId(Long projectId) {
        TaskOverviewDTO taskOverviewDTO = new TaskOverviewDTO();

        TaskStaticsDTO taskStaticsDTO = taskMapper.getOverViewByProjectId(projectId);
        taskOverviewDTO.setTaskStatics(taskStaticsDTO);
        List<StatusDTO> statusList = taskMapper.getStatusDistribution(projectId);
        taskOverviewDTO.setStatus(statusList);
        List<PriorityDTO> priorityList = taskMapper.getPriorityDistribution(projectId);
        taskOverviewDTO.setPriority(priorityList);
        return taskOverviewDTO;
    }

    public TaskOverviewDTO getOverViewByProjectIds(List<Long> projectIds) {
        TaskOverviewDTO taskOverviewDTO = new TaskOverviewDTO();

        TaskStaticsDTO taskStaticsDTO = taskMapper.getOverviewByProjectIds(projectIds);
        taskOverviewDTO.setTaskStatics(taskStaticsDTO);
        List<StatusDTO> statusList = taskMapper.getStatusDistributionByProjectIds(projectIds);
        taskOverviewDTO.setStatus(statusList);
        List<PriorityDTO> priorityList = taskMapper.getPriorityDistributionByProjectIds(projectIds);
        taskOverviewDTO.setPriority(priorityList);
        return taskOverviewDTO;
    }

    public List<MemberInfoDTO> getMemberInfosByProjectIds(List<Long> projectIds) {
        List<MemberInfoDTO> memberInfoDTOList = new ArrayList<MemberInfoDTO>();
        if (projectIds == null || projectIds.isEmpty()) {
            return memberInfoDTOList;
        }
        List<Map<String, Object>> members = taskMapper.getAllMembersByProjectIds(projectIds);
        if (members == null || members.isEmpty()) {
            return memberInfoDTOList;
        }
        for (Map<String, Object> map : members) {
            Long userId = ((Number) map.get("userId")).longValue();
            String userName = (String) map.get("userName");
            MemberInfoDTO memberInfoDTO = new MemberInfoDTO();
            TaskStaticsDTO taskStaticsDTO = taskMapper.getOverviewByProjectIdsAndUserId(projectIds, userId);
            List<MemberTaskDTO> memberTaskInfos = taskMapper.getMemberTaskInfosAndUserId(projectIds, userId);
            memberInfoDTO.setUserName(userName);
            memberInfoDTO.setTaskStatics(taskStaticsDTO);
            memberInfoDTO.setMemberTasks(memberTaskInfos);
            memberInfoDTOList.add(memberInfoDTO);
        }
        return memberInfoDTOList;
    }

    @Override
    public DashboardData getDashboard(Long projectId, String startTime, String dueTime) {
        String loginIdAsString = StpUtil.getLoginIdAsString();
        // 判断是否是超级管理员
        boolean isSuperAdmin = StpUtil.hasRole(loginIdAsString, ProjectConstants.SUPER_ADMIN_ROLE_KEY);

        //判断是否是owner
        Project project = projectService.getById(projectId);
        final boolean isOwner = project != null &&
                project.getOwner() != null &&
                project.getOwner().equals(Long.valueOf(loginIdAsString));


        // 使用 CompletableFuture 并行执行多个任务
        CompletableFuture<Stats> statsFuture = CompletableFuture.supplyAsync(() -> getStats(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin));
        CompletableFuture<List<Trend>> createTrendFuture = CompletableFuture.supplyAsync(() -> getCreateTrend(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin));
        CompletableFuture<List<Trend>> completeTrendFuture = CompletableFuture.supplyAsync(() -> getCompleteTrend(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin));
        CompletableFuture<List<WorkHours>> workHoursFuture = CompletableFuture.supplyAsync(() -> getDailyWorkHours(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin));
        // 等待所有任务完成，并合并结果
        try {
            //聚合 结果
            Stats stats = statsFuture.get();
            List<Trend> createTrend = createTrendFuture.get();
            List<Trend> completeTrend = completeTrendFuture.get();
            List<WorkHours> workHours = workHoursFuture.get();

            DashboardData data = new DashboardData();
            data.setStats(stats);
            data.setCreateTrend(createTrend);
            data.setCompleteTrend(completeTrend);
            data.setWorkHours(workHours);
            return data;
        } catch (Exception e) {
            throw new BusinessException("查询失败");
        }
    }


    /**
     * 获取任务状态统计
     */
    public Stats getStats(Long projectId, String startTime, String dueTime, String loginIdAsString, boolean isOwner, boolean isSuperAdmin) {
        Stats stats = taskMapper.getStats(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin);
        if (stats == null) {
            stats = new Stats(); // 创建空对象
        }
        // 设置项目总数
        stats.setTotalProjects(projectService.getProjectCountByUserId(loginIdAsString));

        return stats;
    }

//    // 了解每天的工作时间
//    private List<WorkHours> getDailyWorkHours(Long projectId, String startTime, String dueTime, String loginIdAsString, boolean isOwner,boolean isSuperAdmin) {
//
//        // 1. 查询任务 ID 列表
//        List<Task> tasks = taskMapper.getAllTasksIdsByloginId(projectId, startTime, dueTime, loginIdAsString, isOwner,isSuperAdmin);
//
//        List<Long> taskIds = tasks.stream().map(Task::getId).toList();
//        // 2. 获取工时数据，若为空则返回空列表
//        List<WorkHours> workHours = taskIds == null || taskIds.isEmpty()
//                ? Collections.emptyList()
//                : taskMapper.getDailyWorkHours(taskIds);
//
//        // 3. 构建时间段内所有日期
//        List<String> allDates = generateDateRange(startTime, dueTime);
//
//        // 4. 转换为 Map<date, hours>，默认值为 0.0
//        Map<String, Double> hoursMap = Optional.ofNullable(workHours)
//                .orElse(Collections.emptyList())
//                .stream()
//                .collect(Collectors.toMap(
//                        WorkHours::getDate,
//                        WorkHours::getHours,
//                        (a, b) -> b, // 合并策略：保留后者
//                        HashMap::new
//                ));
//
//        // 5. 补全缺失日期，设置为 0.0
//        return allDates.stream()
//                .map(date -> {
//                    WorkHours item = new WorkHours();
//                    item.setDate(date);
//                    item.setHours(hoursMap.getOrDefault(date, 0.0));
//                    return item;
//                })
//                .collect(Collectors.toList());
//    }

    // 获取任务完成趋势
    private List<Trend> getCompleteTrend(Long projectId, String startTime, String dueTime, String loginIdAsString, boolean isOwner, boolean isSuperAdmin) {
        List<Trend> completeTrend = taskMapper.getCompleteTrend(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin);

        List<String> allDates = generateDateRange(startTime, dueTime);

        Map<String, Integer> countMap = completeTrend.stream()
                .collect(Collectors.toMap(Trend::getDate, Trend::getCount, (a, b) -> b));

        return allDates.stream()
                .map(date -> {
                    Trend item = new Trend();
                    item.setDate(date);
                    item.setCount(countMap.getOrDefault(date, 0));
                    return item;
                })
                .collect(Collectors.toList());
    }

    // 获取任务创建趋势
    private List<Trend> getCreateTrend(Long projectId, String startTime, String dueTime, String loginIdAsString, boolean isOwner, boolean isSuperAdmin) {
        List<Trend> createTrend = taskMapper.getCreateTrend(projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin);

        List<String> allDates = generateDateRange(startTime, dueTime);

        Map<String, Integer> countMap = createTrend.stream()
                .collect(Collectors.toMap(Trend::getDate, Trend::getCount, (a, b) -> b));

        return allDates.stream()
                .map(date -> {
                    Trend item = new Trend();
                    item.setDate(date);
                    item.setCount(countMap.getOrDefault(date, 0));
                    return item;
                })
                .collect(Collectors.toList());
    }

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");


    /**
     * 了解每天的工作时间（优化版：事件点 + 数学公式）
     *
     * @param projectId       项目ID
     * @param startTime       开始时间 (yyyy-MM-dd)
     * @param dueTime         截止时间 (yyyy-MM-dd)
     * @param loginIdAsString 当前登录用户ID
     * @param isOwner         是否是项目负责人
     * @param isSuperAdmin    是否是超级管理员
     * @return 每日工时列表
     */
    public List<WorkHours> getDailyWorkHours(
            Long projectId,
            String startTime,
            String dueTime,
            String loginIdAsString,
            boolean isOwner,
            boolean isSuperAdmin) {

        try {
            // 1. 转换为 LocalDate

            // ✅ 使用 LocalDateTime 解析
            LocalDateTime startDateTime = LocalDateTime.parse(startTime, DATE_TIME_FORMATTER);
            LocalDateTime endDateTime = LocalDateTime.parse(dueTime, DATE_TIME_FORMATTER);

// ✅ 提取 LocalDate（仅日期部分）
            LocalDate start = startDateTime.toLocalDate();
            LocalDate end = endDateTime.toLocalDate();

            if (start.isAfter(end)) {
                return Collections.emptyList();
            }

            // 2. 查询任务列表（仅查询必要字段）
            List<Task> tasks = taskMapper.getAllTasksIdsByloginId(
                    projectId, startTime, dueTime, loginIdAsString, isOwner, isSuperAdmin);

            // 3. 若无任务，返回全0
            if (tasks == null || tasks.isEmpty()) {
                return generateEmptyWorkHours(start, end);
            }

            // 4. 收集“事件点”：每个任务对每日工时的影响
            List<EventPoint> events = new ArrayList<>();

            for (Task task : tasks) {
                // ✅ 正确转换 Date → LocalDate
                LocalDate taskStart = task.getStartTime()
                        .toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                        .toLocalDate();

                LocalDate taskEnd = task.getDueDate()
                        .toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime()
                        .toLocalDate();

                // 计算总天数（至少为1）
                long totalDays = Math.max(1L, ChronoUnit.DAYS.between(taskStart, taskEnd) + 1);

                // ✅ 使用 BigDecimal.divide() 计算每日工时
                BigDecimal estimatedHours = task.getEstimatedHours();
                BigDecimal dailyHours = estimatedHours.divide(
                        BigDecimal.valueOf(totalDays),
                        2,
                        BigDecimal.ROUND_HALF_UP
                );

                // 添加事件点
                events.add(new EventPoint(taskStart, dailyHours.doubleValue()));
                events.add(new EventPoint(taskEnd.plusDays(1), -dailyHours.doubleValue()));
            }

            // 5. 按日期排序
            events.sort(Comparator.comparing(EventPoint::date));

            // 6. 遍历事件点，生成每日工时
            List<WorkHours> result = new ArrayList<>();
            double currentHours = 0.0;
            LocalDate currentDate = null;

            for (EventPoint event : events) {
                if (currentDate == null) {
                    currentDate = event.date();
                } else {
                    // ✅ 从上一个事件点到当前事件点之间，工时恒定
                    long daysBetween = ChronoUnit.DAYS.between(currentDate, event.date());
                    if (daysBetween > 0) {
                        for (long i = 0; i < daysBetween; i++) {
                            LocalDate day = currentDate.plusDays(i);
                            // ✅ 只在目标时间段内添加
                            if (day.isBefore(start) || day.isAfter(end)) continue;

                            WorkHours item = new WorkHours();
                            item.setDate(day.toString());
                            item.setHours(Math.round(currentHours * 100.0) / 100.0); // 保留两位小数
                            result.add(item);
                        }
                    }
                    currentDate = event.date();
                }

                // ✅ 更新当前工时
                currentHours += event.delta();
            }

            // 8. 构建时间段内所有日期
            List<String> allDates = generateDateRange(startTime, dueTime);

            // 9. 转换为 Map<date, hours>，默认值为 0.0
            Map<String, Double> hoursMap = Optional.ofNullable(result)
                    .orElse(Collections.emptyList())
                    .stream()
                    .collect(Collectors.toMap(
                            WorkHours::getDate,
                            WorkHours::getHours,
                            (a, b) -> b, // 合并策略：保留后者
                            HashMap::new
                    ));

            // 10. 补全缺失日期，设置为 0.0
            return allDates.stream()
                    .map(date -> {
                        WorkHours item = new WorkHours();
                        item.setDate(date);
                        item.setHours(hoursMap.getOrDefault(date, 0.0));
                        return item;
                    })
                    .collect(Collectors.toList());


        } catch (Exception e) {
            // ✅ 日志记录
            System.err.println("【ERROR】获取每日工时失败: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * 生成空工时数据（用于无任务场景）
     */
    private List<WorkHours> generateEmptyWorkHours(LocalDate start, LocalDate end) {
        List<WorkHours> result = new ArrayList<>();
        LocalDate current = start;

        while (!current.isAfter(end)) {
            WorkHours item = new WorkHours();
            item.setDate(current.toString());
            item.setHours(0.0);
            result.add(item);
            current = current.plusDays(1);
        }

        return result;
    }

    // ================== 内部类：事件点 ==================
    record EventPoint(LocalDate date, double delta) {
        // delta: 工时变化量（+表示增加，-表示减少）
    }


    /**
     * 生成从 startTime 到 dueTime（含）之间的所有日期字符串列表
     * 支持带时分秒的时间格式（如 "2025-04-10 08:30:00"）
     *
     * @param startTime 起始时间，格式：yyyy-MM-dd HH:mm:ss
     * @param dueTime   结束时间，格式：yyyy-MM-dd HH:mm:ss
     * @return 日期列表，如 ["2025-04-10", "2025-04-11", ...]
     */
    private List<String> generateDateRange(String startTime, String dueTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        LocalDateTime start = LocalDateTime.parse(startTime, formatter);
        LocalDateTime end = LocalDateTime.parse(dueTime, formatter);

        // 如果 startTime > dueTime，则交换顺序
        if (start.isAfter(end)) {
            LocalDateTime temp = start;
            start = end;
            end = temp;
        }

        // 构建日期列表
        List<String> dates = new ArrayList<>();
        LocalDate current = start.toLocalDate();

        while (!current.isAfter(end.toLocalDate())) {
            dates.add(current.toString());
            current = current.plusDays(1);
        }

        return dates;
    }
}




