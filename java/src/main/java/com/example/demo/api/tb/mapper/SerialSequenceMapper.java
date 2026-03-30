package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.PermissionRelation;
import com.example.demo.api.tb.domain.SerialSequence;
import org.apache.ibatis.annotations.*;


@Mapper
public interface SerialSequenceMapper extends BaseMapper<SerialSequence> {

    @Insert("INSERT IGNORE INTO serial_sequence (biz_type , project_id, scope_key, current_value) " +
            "VALUES (#{bizType}, #{projectId},#{scopeKey}, 0)")
    void initSequence(@Param("bizType") String bizType, @Param("scopeKey") String scopeKey, @Param("projectId") Long projectId);

    @Update("UPDATE serial_sequence " +
            "SET current_value = LAST_INSERT_ID(current_value + 1) " +
            "WHERE biz_type = #{bizType} AND scope_key = #{scopeKey} AND project_id=  #{projectId}")
    void increment(@Param("bizType") String bizType, @Param("scopeKey") String scopeKey, @Param("projectId") Long projectId);

    @Select("SELECT LAST_INSERT_ID()")
    Integer getNewValue();

}




