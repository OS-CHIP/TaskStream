package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.domain.UpdateLog;
import org.apache.ibatis.annotations.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface UpdateLogMapper extends BaseMapper<UpdateLog> {

    /**
     * 分页查询更新日志
     */
    IPage<UpdateLog> selectPageByCondition(Page<UpdateLog> page,
                                           @Param("tableName") String tableName,
                                           @Param("recordId") Long recordId,
                                           @Param("operationType") String operationType,
                                           @Param("createBy") String createBy,
                                           @Param("startTime") String startTime,
                                           @Param("endTime") String endTime);

    /**
     * 统计每日更新日志数量
     */
    List<Map<String, Object>> countLogsByDay(@Param("startTime") LocalDateTime startTime,
                                             @Param("endTime") LocalDateTime endTime);

    /**
     * 批量插入更新日志
     */
    int batchInsert(@Param("list") List<UpdateLog> logs);
}