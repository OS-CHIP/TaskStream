package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 工作流节点之间的流转规则
 * 对应数据库表：workflow_transition
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("workflow_transition")
public class WorkflowTransition {

    /**
     * 流转规则主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 所属工作流ID
     */
    @TableField("workflow_id")
    private Integer workflowId;

    /**
     * 源节点ID
     */
    @TableField("from_node_id")
    private Integer fromNodeId;

    /**
     * 目标节点ID
     */
    @TableField("to_node_id")
    private Integer toNodeId;

    /**
     * 流转按钮/操作名称（如“同意”、“驳回”）
     */
    @TableField("name")
    private String name;

    /**
     * 流转条件表达式（如 ${task.priority} == "high"），为空表示无条件
     */
    @TableField("condition_expr")
    private String conditionExpr;

    /**
     * 操作类型：normal-普通, rollback-回退, jump-跳转
     */
    @TableField("action_type")
    private String actionType;

    /**
     * 是否自动流转（无需人工干预）
     */
    @TableField("is_auto")
    private Boolean isAuto;

    /**
     * 排序权重，用于前端按钮排序
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private LocalDateTime updateTime;
}