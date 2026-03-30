package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 工作流实例操作历史记录
 * 对应数据库表：workflow_history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("workflow_history")
public class WorkflowHistory {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 关联的工作流实例ID
     */
    @TableField("instance_id")
    private Integer instanceId;

    /**
     * 来源节点ID，NULL 表示起始（如开始节点无前驱）
     */
    @TableField("from_node_id")
    private Integer fromNodeId;

    /**
     * 目标节点ID（必填）
     */
    @TableField("to_node_id")
    private Integer toNodeId;

    /**
     * 操作人用户ID
     */
    @TableField("operator_id")
    private Integer operatorId;

    /**
     * 操作名称（如 approve, reject）
     */
    @TableField("action")
    private String action;

    /**
     * 操作备注/意见，最多500字符
     */
    @TableField("comment")
    private String comment;

    /**
     * 操作时间
     */
    @TableField("operate_time")
    private LocalDateTime operateTime;
}