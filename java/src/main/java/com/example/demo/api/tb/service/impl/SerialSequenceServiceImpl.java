package com.example.demo.api.tb.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.domain.SerialSequence;
import com.example.demo.api.tb.mapper.SerialSequenceMapper;
import com.example.demo.api.tb.service.AttachmentService;
import com.example.demo.api.tb.service.SerialSequenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author ji156
 * @description 针对表【comment】的数据库操作Service实现
 * @createDate 2025-02-10 17:00:07
 */
@Service
@Slf4j
public class SerialSequenceServiceImpl extends ServiceImpl<SerialSequenceMapper, SerialSequence>  implements SerialSequenceService {


    @Autowired
    private SerialSequenceMapper sequenceMapper;

    /**
     * 生成编号
     * @param bizType 业务类型，如 "TASK"
     * @param scopeKey 作用域，如 "project_101"
     * @return 如 TASK-project_101-0001
     */
    @Transactional(rollbackFor = Exception.class)
    public String generate(String bizType, String scopeKey,Long projectId) {
        // 1. 初始化序列（幂等）
        sequenceMapper.initSequence(bizType, scopeKey,projectId);

        // 2. 原子递增
        sequenceMapper.increment(bizType, scopeKey,projectId);
        Integer newValue = sequenceMapper.getNewValue();

        // 4. 拼接编号（你也可以自定义格式）
        return String.format("%s-%s", scopeKey, newValue);
    }


}







