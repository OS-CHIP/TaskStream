package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.TaskFieldValues;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.ArrayList;

/**
* @author ji156
* @description 针对表【field_values】的数据库操作Mapper
* @createDate 2025-02-10 17:00:23
* @Entity com.example.demo.api.tb.domain.FieldValues
*/
@Mapper
public interface FieldValuesMapper extends BaseMapper<TaskFieldValues> {

    void saveFieldValuesList(@Param("fieldValuesList") ArrayList<TaskFieldValues> fieldValuesList);
}




