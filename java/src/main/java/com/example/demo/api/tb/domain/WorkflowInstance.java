package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 工作流实例，绑定具体业务对象
 * 对应数据库表：workflow_instance
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("workflow_instance")
public class WorkflowInstance {

    /**
     * 实例主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联的工作流定义ID（workflow.id）
     */
    @TableField("workflow_id")
    private Integer workflowId;

    /**
     * 业务类型（如 task, risk, contract）
     */
    @TableField("business_type")
    private String businessType;

    /**
     * 业务对象ID（如 task.id）
     */
    @TableField("business_id")
    private Integer businessId;

    /**
     * 当前所在节点ID（null 表示尚未开始或已结束）
     */
    @TableField("current_node_id")
    private Integer currentNodeId;

    /**
     * 实例状态：running / completed / terminated
     */
    @TableField("status")
    private String status;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 结束时间（completed 或 terminated 时填充）
     */
    @TableField("end_time")
    private LocalDateTime endTime;
}