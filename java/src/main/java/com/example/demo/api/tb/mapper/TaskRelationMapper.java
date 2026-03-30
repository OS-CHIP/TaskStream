package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import com.example.demo.api.tb.domain.Task;
import com.example.demo.api.tb.domain.TaskRelation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface TaskRelationMapper extends BaseMapper<TaskRelation> {


    // 查询所有相关任务（去重）
    List<Task> selectAllRelatedTasks(@Param("taskId") Long taskId);

    // 查询所有相关关系（两端都在上述任务中）
    List<TaskRelation> selectAllRelatedRelations(@Param("taskId") Long taskId);

    List<TaskRelation> selectRelationsWithinTasks(@Param("taskIds") List<Long> taskIds);

    // 判断是否为叶子节点
    boolean isLeafNode(Long taskId);


    List<Long> findDescendants(Long ancestorId);
}
