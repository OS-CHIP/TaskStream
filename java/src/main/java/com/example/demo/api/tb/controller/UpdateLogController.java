package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.demo.api.tb.domain.UpdateLog;
import com.example.demo.api.tb.service.UpdateLogService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * @author ji156
 */
@Validated
@Slf4j
@RestController
@RequestMapping("/updateLogs")
public class UpdateLogController {

    @Resource
    private UpdateLogService updateLogService;


    /**
     * 分页查询更新日志
     */
    @PostMapping("/queryUpdateLogs")
    public SaResult queryUpdateLogs(
            @RequestParam String tableName,
            @RequestParam Long recordId,
            @RequestParam(required = false) String operationType,
            @RequestParam(required = false) String createBy,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(defaultValue = "1") @Min(1) int currentPage,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int pageSize) {

        try {
            // 记录请求参数，便于排查问题
            log.info("查询更新日志参数: tableName={}, recordId={}, operationType={}, createBy={}, startTime={}, endTime={}, currentPage={}, pageSize={}",
                    tableName, recordId, operationType, createBy, startTime, endTime, currentPage, pageSize);

            IPage<UpdateLog> result = updateLogService.queryUpdateLogs(
                    tableName, recordId, operationType, createBy, startTime, endTime, currentPage, pageSize);
            return SaResult.ok().setData(result);
        } catch (Exception e) {
            // 统一异常处理
            log.error("查询更新日志失败: tableName={}, recordId={}, operationType={}, createBy={}, startTime={}, endTime={}, currentPage={}, pageSize={}",
                    tableName, recordId, operationType, createBy, startTime, endTime, currentPage, pageSize, e);
            return SaResult.error("查询更新日志失败");
        }
    }


    /**
     * 记录更新日志
     */
    @PostMapping
    public boolean recordUpdateLog(@RequestBody UpdateLog updateLog) {
        return updateLogService.saveUpdateLog(updateLog);
    }

    /**
     * 批量记录更新日志
     */
    @PostMapping("/batch")
    public boolean recordBatchUpdateLogs(@RequestBody List<UpdateLog> logs) {
        return updateLogService.saveBatchUpdateLogs(logs);
    }


    /**
     * 获取指定表和记录的更新历史
     */
    @GetMapping("/history")
    public List<UpdateLog> getUpdateHistory(
            @RequestParam String tableName,
            @RequestParam Long recordId,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {

        LocalDateTime start = startTime != null ? LocalDateTime.parse(startTime) : null;
        LocalDateTime end = endTime != null ? LocalDateTime.parse(endTime) : null;

        return updateLogService.getUpdateHistory(tableName, recordId, start, end);
    }

    /**
     * 获取操作人的更新历史
     */
    @GetMapping("/operator")
    public List<UpdateLog> getOperatorHistory(
            @RequestParam String operator,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {

        LocalDateTime start = startTime != null ? LocalDateTime.parse(startTime) : null;
        LocalDateTime end = endTime != null ? LocalDateTime.parse(endTime) : null;

        return updateLogService.getOperatorHistory(operator, start, end);
    }

    /**
     * 获取最近的更新日志
     */
    @GetMapping("/recent")
    public List<UpdateLog> getRecentLogs(@RequestParam(defaultValue = "10") int limit) {
        return updateLogService.getRecentLogs(limit);
    }

    /**
     * 获取指定时间范围内的更新日志
     */
    @GetMapping("/time-range")
    public List<UpdateLog> getLogsByTimeRange(
            @RequestParam String startTime,
            @RequestParam String endTime) {

        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);

        return updateLogService.getLogsByTimeRange(start, end);
    }

    /**
     * 获取每日更新统计
     */
    @GetMapping("/statistics")
    public List<Map<String, Object>> getDailyStatistics(
            @RequestParam String startTime,
            @RequestParam String endTime) {

        LocalDateTime start = LocalDateTime.parse(startTime);
        LocalDateTime end = LocalDateTime.parse(endTime);

        return updateLogService.getDailyStatistics(start, end);
    }

    /**
     * 删除过期日志
     */
    @DeleteMapping
    public boolean deleteExpiredLogs(@RequestParam String expireTime) {
        LocalDateTime expire = LocalDateTime.parse(expireTime);
        return updateLogService.deleteExpiredLogs(expire);
    }
}