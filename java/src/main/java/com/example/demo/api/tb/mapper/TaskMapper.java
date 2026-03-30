package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.Task;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.dto.*;
import com.example.demo.api.tb.domain.vo.Dashboard.Stats;
import com.example.demo.api.tb.domain.vo.Dashboard.Trend;
import com.example.demo.api.tb.domain.vo.Dashboard.WorkHours;
import com.example.demo.api.tb.domain.vo.TaskVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
* @author ji156
* @description 针对表【tasks】的数据库操作Mapper
* @createDate 2025-02-10 17:01:22
* @Entity com.example.demo.api.tb.domain.Tasks
*/
@Mapper
public interface TaskMapper extends BaseMapper<Task> {


    ArrayList<LinkedHashMap<Object, Object>> selectinfo(@Param("fields") ArrayList<String> fields, @Param("tasksId") Long tasksId);


    ArrayList<String> getFieldNames(Long tasksId);

    ArrayList<LinkedHashMap<Object, Object>> queryTaskTemplate(@Param("taskTypeId") Long taskTypeId);

    List<TaskVO> getAllTasksWithLevel(Long taskId);

    List<Task> getChildrenTasks(Long parentId);

    List<Task> selectParentTasks(Long childId);

    TaskVO selectTaskDetailById(Long tasksId);

    TaskStaticsDTO getOverViewByProjectId(Long projectId);

    List<StatusDTO> getStatusDistribution(@Param("projectId") Long projectId);

    List<PriorityDTO> getPriorityDistribution(@Param("projectId") Long projectId);

    TaskStaticsDTO getOverviewByProjectIds(@Param("projectIds") List<Long> projectIds);

    List<StatusDTO> getStatusDistributionByProjectIds(@Param("projectIds") List<Long> projectIds);

    List<PriorityDTO> getPriorityDistributionByProjectIds(@Param("projectIds") List<Long> projectIds);

    List<Map<String, Object>> getAllMembersByProjectIds(@Param("projectIds") List<Long> projectIds);

    TaskStaticsDTO getOverviewByProjectIdsAndUserId(@Param("projectIds") List<Long> projectIds, @Param("userId") Long userId);

    List<MemberTaskDTO> getMemberTaskInfosAndUserId(@Param("projectIds") List<Long> projectIds, @Param("userId") Long userId);

    Stats getStats(@Param("projectId") Long projectId,@Param("startTime") String startTime,@Param("dueTime") String dueTime,@Param("loginIdAsString") String loginIdAsString,@Param("isOwner") boolean isOwner,@Param("isSuperAdmin") boolean isSuperAdmin);

    List<Trend> getCompleteTrend(@Param("projectId") Long projectId,@Param("startTime") String startTime,@Param("dueTime") String dueTime,@Param("loginIdAsString") String loginIdAsString,@Param("isOwner") boolean isOwner,@Param("isSuperAdmin") boolean isSuperAdmin);

    List<Trend> getCreateTrend(@Param("projectId") Long projectId,@Param("startTime") String startTime,@Param("dueTime") String dueTime,@Param("loginIdAsString") String loginIdAsString,@Param("isOwner") boolean isOwner,@Param("isSuperAdmin") boolean isSuperAdmin);


//    List<Long> getAllTasksIdsByloginId(@Param("projectId") Long projectId,@Param("startTime") String startTime,@Param("dueTime") String dueTime,@Param("loginIdAsString") String loginIdAsString,@Param("isOwner") boolean isOwner,@Param("isSuperAdmin") boolean isSuperAdmin);
    List<Task> getAllTasksIdsByloginId(@Param("projectId") Long projectId,@Param("startTime") String startTime,@Param("dueTime") String dueTime,@Param("loginIdAsString") String loginIdAsString,@Param("isOwner") boolean isOwner,@Param("isSuperAdmin") boolean isSuperAdmin);

    List<WorkHours> getDailyWorkHours(@Param("taskIds")  List<Long> taskIds);

}




