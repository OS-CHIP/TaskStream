package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.TaskFields;
import com.example.demo.api.tb.domain.TaskType;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.ArrayList;

/**
* @author ji156
* @description 针对表【task_type】的数据库操作Mapper
* @createDate 2025-02-10 17:01:20
* @Entity com.example.demo.api.tb.domain.TaskType
*/
@Mapper
public interface TaskTypeMapper extends BaseMapper<TaskType> {


//    void saveTaskTypeTemplate(@Param("taskFields")  ArrayList<TaskFields> taskFields);
}




