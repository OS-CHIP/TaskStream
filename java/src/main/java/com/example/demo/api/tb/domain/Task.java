package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * 任务主表(Tasks)实体类
 *
 * 对应数据库表：tasks
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true) // 支持链式调用，如 new Task().setId(1).setTaskTitle("xxx")
@TableName("task") // 指定对应的数据库表名
public class Task extends BaseEntity implements Serializable  {

    private static final long serialVersionUID = 1L;

    /**
     * 任务主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 任务编号
     */
    @TableField("task_code")
    private String taskCode;
    /**
     * 任务名称
     */
    @TableField("task_title")
    private String taskTitle;

    /**
     * 任务类型ID
     */
    @TableField("task_type_id")
    private Long taskTypeId;

    /**
     * 创建标签
     */
    @TableField("tags")
    private String tags;

    /**
     * 项目ID
     */
    @TableField("project_id")
    private Long projectId;

    /**
     * 任务描述
     */
    @TableField("description")
    private String description;

    /**
     * 优先级（高/中/低）
     */
    @TableField("priority")
    private String priority;

    /**
     * 负责人ID
     */
    @TableField("assigner")
    private String assigner;

    /**
     * 任务参与者列表
     * 存储有只读权限的用户ID，多个ID用英文逗号分隔，例如 "1001,1002,1003"
     */
    private String observers;

//    /**
//     * 父任务ID
//     */
//    @TableField("parent_id")
//    private Long parentId;

    /**
     * 执行人ID
     */
    @TableField("assignee")
    private String assignee;

    /**
     * 预估工时(小时)
     */
    @TableField("estimated_hours")
    private BigDecimal estimatedHours;

    /**
     * 任务状态
     */
    @TableField("status")
    private String status;

    /**
     * 任务百分比
     */
    @TableField("completion_percentage")
    private String completionPercentage;

    /**
     * 开始时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date startTime;

    /**
     * 截止时间
     */
    @TableField("due_date")
    private Date dueDate;

    /**
     * 实际完成时间
     */
    @TableField("actual_finish_time")
    private Date actualFinishTime;

    /**
     * 逻辑删除 默认是 0
     */
    @TableLogic
    private Integer isDeleted;

}