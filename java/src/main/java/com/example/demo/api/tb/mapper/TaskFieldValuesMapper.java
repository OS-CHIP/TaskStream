package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.TaskFieldValues;
import com.example.demo.api.tb.domain.TaskType;
import org.apache.ibatis.annotations.Mapper;

/**
* @author ji156
* @description 针对表【task_type】的数据库操作Mapper
* @createDate 2025-02-10 17:01:20
* @Entity com.example.demo.api.tb.domain.TaskType
*/
@Mapper
public interface TaskFieldValuesMapper extends BaseMapper<TaskFieldValues> {
}




