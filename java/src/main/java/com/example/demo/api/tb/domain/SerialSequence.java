package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("serial_sequence")
public class SerialSequence {


    /**
     * 业务类型，如 TASK, REQUIREMENT
     */
    private String bizType;

    /**
     * 项目ID
     */
    private Long projectId;

    /**
     * 作用域标识，如 project_101, global
     */
    private String scopeKey;

    /**
     * 当前序号
     */
    private Integer currentValue;

}
