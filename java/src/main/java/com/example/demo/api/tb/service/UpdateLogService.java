package com.example.demo.api.tb.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.demo.api.tb.domain.UpdateLog;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface UpdateLogService {


    /**
     * 分页查询更新日志
     */
    IPage<UpdateLog> queryUpdateLogs(String tableName,
                                     Long recordId,
                                     String operationType,
                                     String createBy,
                                     String startTime,
                                     String endTime,
                                     int currentPage,
                                     int pageSize);


    /**
     * 保存更新日志
     */
    boolean saveUpdateLog(UpdateLog updateLog);

    /**
     * 批量保存更新日志
     */
    boolean saveBatchUpdateLogs(List<UpdateLog> logs);


    /**
     * 获取指定表和记录的更新历史
     */
    List<UpdateLog> getUpdateHistory(String tableName, Long recordId, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取操作人的更新历史
     */
    List<UpdateLog> getOperatorHistory(String operator, LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取最近的更新日志
     */
    List<UpdateLog> getRecentLogs(int limit);

    /**
     * 获取指定时间范围内的更新日志
     */
    List<UpdateLog> getLogsByTimeRange(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 获取每日更新统计
     */
    List<Map<String, Object>> getDailyStatistics(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * 删除过期日志
     */
    boolean deleteExpiredLogs(LocalDateTime expireTime);
}