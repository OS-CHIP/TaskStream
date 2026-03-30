package com.example.demo.api.tb.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.WorkflowHistory;
import com.example.demo.api.tb.domain.WorkflowInstance;
import org.apache.ibatis.annotations.Mapper;

/**
* @author ji156
* @description 针对表【workflow_node】的数据库操作Mapper
* @createDate 2025-02-10 17:01:29
* @Entity com.example.demo.api.tb.domain.WorkflowNode
*/
@Mapper
public interface WorkflowHistoryMapper extends BaseMapper<WorkflowHistory> {

}




