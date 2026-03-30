package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * 任务模板字段定义表
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("task_fields")
public class TaskFields {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 任务类型ID
     */
    @TableField("task_type_id")
    private Long taskTypeId;

    /**
     * 字段标识符（下拉框）
     */
    @TableField("name")
    private String name;

    /**
     * 组件类型，对应 component.component_key
     */
    @TableField("type")
    private String type;

    /**
     * 字段显示名称
     */
    @TableField("label")
    private String label;

    /**
     * 是否必填：1-是，0-否
     */
    @TableField("is_required")
    private Boolean isRequired;

    /**
     * 是否隐藏：0-隐藏，1-显示
     */
    @TableField("is_hidden")
    private Boolean isHidden;

    /**
     * 静态选项（仅适用于 select/radio 等），JSON 字符串格式
     */
    @TableField("options")
    private String options;

    /**
     * 覆盖 component 的默认配置，JSON 字符串格式
     */
    @TableField("config_override")
    private String configOverride;

    /**
     * 排序值
     */
    @TableField("sort")
    private Integer sort;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}