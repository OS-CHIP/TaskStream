package com.example.demo.api.tb.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.UpdateLog;
import com.example.demo.api.tb.mapper.UpdateLogMapper;
import com.example.demo.api.tb.service.UpdateLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional(rollbackFor = Exception.class)
public class UpdateLogServiceImpl extends ServiceImpl<UpdateLogMapper, UpdateLog> implements UpdateLogService {

    @Override
    public boolean saveUpdateLog(UpdateLog updateLog) {
        return this.save(updateLog);
    }

    @Override
    public boolean saveBatchUpdateLogs(List<UpdateLog> logs) {
        if (logs == null || logs.isEmpty()) {
            return false;
        }
        return this.saveBatch(logs);
    }

    @Override
    public IPage<UpdateLog> queryUpdateLogs(String tableName,
                                            Long recordId,
                                            String operationType,
                                            String createBy,
                                            String startTime,
                                            String endTime,
                                            int currentPage,
                                            int pageSize) {
        Page<UpdateLog> page = new Page<>(currentPage, pageSize);
        return baseMapper.selectPageByCondition(page, tableName, recordId, operationType, createBy, startTime, endTime);
    }

    @Override
    public List<UpdateLog> getUpdateHistory(String tableName, Long recordId, LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<UpdateLog> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UpdateLog::getTableName, tableName)
                .eq(UpdateLog::getRecordId, recordId);

        if (startTime != null) {
            queryWrapper.ge(UpdateLog::getCreateTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(UpdateLog::getCreateTime, endTime);
        }

        queryWrapper.orderByDesc(UpdateLog::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public List<UpdateLog> getOperatorHistory(String operator, LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<UpdateLog> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UpdateLog::getCreateBy, operator);

        if (startTime != null) {
            queryWrapper.ge(UpdateLog::getCreateTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(UpdateLog::getCreateTime, endTime);
        }

        queryWrapper.orderByDesc(UpdateLog::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public List<UpdateLog> getRecentLogs(int limit) {
        LambdaQueryWrapper<UpdateLog> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.orderByDesc(UpdateLog::getCreateTime);
        queryWrapper.last("LIMIT " + limit);
        return this.list(queryWrapper);
    }

    @Override
    public List<UpdateLog> getLogsByTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<UpdateLog> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.between(UpdateLog::getCreateTime, startTime, endTime);
        queryWrapper.orderByDesc(UpdateLog::getCreateTime);
        return this.list(queryWrapper);
    }

    @Override
    public List<Map<String, Object>> getDailyStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        return baseMapper.countLogsByDay(startTime, endTime);
    }

    @Override
    public boolean deleteExpiredLogs(LocalDateTime expireTime) {
        LambdaQueryWrapper<UpdateLog> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.le(UpdateLog::getCreateTime, expireTime);
        return this.remove(queryWrapper);
    }
}