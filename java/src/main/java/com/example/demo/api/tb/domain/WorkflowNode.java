package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 工作流节点定义
 * 对应数据库表：workflow_node
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("workflow_node")
public class WorkflowNode {

    /**
     * 节点主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 所属工作流ID
     */
    @TableField("workflow_id")
    private Integer workflowId;

    /**
     * 节点唯一标识（如 submit, approve, close）
     */
    @TableField("node_key")
    private String nodeKey;

    /**
     * 节点显示名称
     */
    @TableField("name")
    private String name;

    /**
     * 节点类型：manual-人工处理, auto-自动执行, condition-条件分支
     */
    @TableField("type")
    private String type;

    /**
     * 指派方式：user-指定用户, role-角色, dept-部门, script-脚本计算
     */
    @TableField("assign_type")
    private String assignType;

    /**
     * 指派值（如角色ID、用户ID、脚本表达式）
     */
    @TableField("assign_value")
    private String assignValue;

    /**
     * 是否为开始节点
     */
    @TableField("is_start")
    private Boolean isStart;

    /**
     * 是否为结束节点
     */
    @TableField("is_end")
    private Boolean isEnd;

    /**
     * 排序权重，用于前端展示或默认流转顺序
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 节点描述
     */
    @TableField("description")
    private String description;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private Date updateTime;
}