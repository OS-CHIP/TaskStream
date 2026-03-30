package com.example.demo.api.tb.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.demo.api.tb.domain.Task;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.dto.*;
import com.example.demo.api.tb.domain.vo.Dashboard.DashboardData;
import com.example.demo.api.tb.domain.vo.TaskListVO;
import com.example.demo.api.tb.domain.vo.TaskVO;


import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.*;

/**
* @author ji156
* @description 针对表【tasks】的数据库操作Service
* @createDate 2025-02-10 17:01:22
*/
public interface TaskService extends IService<Task> {



    Task createTask( TaskCreateDTO taskCreateDTO);

    IPage<Task> queryTaskPage(String taskCode,String taskTitle,String status, String priority,Long projectId, Integer pageNum,Integer pageSize,String assignee,String assigner);

    void updateTask(TaskCreateDTO taskCreateDTO);

    List<TaskVO> getAllTasksWithLevel(Long taskId);

    List<Task> getChildrenTasks(Long parentId);

    void transferTask(Long taskId, String newAssignee, String reason, Long loginId, Long projectId);

    TaskVO selectOne(Long tasksId);

    TaskListVO getTasksWithMultipleParentsAndChildren(Long taskId);

    List<Task> getParentTasks(Long taskId);

    IPage<Task> queryMyTaskPage(String taskCode, String taskTitle, String status, String priority, Long aLong, Integer pageNum,  Integer pageSize, Long userId);

    Set<String> selectTagList(Long projectId);

    TaskOverviewDTO getOverViewByProjectId(Long projectId);
    TaskOverviewDTO getOverViewByProjectIds(List<Long> projectIds);

    List<MemberInfoDTO> getMemberInfosByProjectIds(List<Long> projectIds);


    void createSubProjectOa(@Valid CreateSubProjectOaDTO createSubProjectOaDTO);


    List<Task> getGanttData(Long projectId,  String startTime, String dueTime);


    DashboardData getDashboard(Long projectId, String startTime, String dueTime);

    void updateTaskStatus(UpdateTaskStatusDTO dto);

    void deleteTaskById(@NotNull(message = "任务ID不能为空") @Min(value = 1, message = "任务ID必须大于0") Long tasksId);
}
