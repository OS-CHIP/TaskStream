package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 工作流定义实体类
 * 对应数据库表：workflow
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("workflow")
public class Workflow {

    /**
     * 主键ID，自增
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 工作流名称
     */
    @TableField("name")
    private String name;

    /**
     * 唯一编码，用于系统识别（如 TASK_APPROVAL）
     */
    @TableField("code")
    private String code;

    /**
     * 描述信息
     */
    @TableField("description")
    private String description;

    /**
     * 所属项目ID，NULL 表示全局工作流
     */
    @TableField("project_id")
    private Integer projectId;

    /**
     * 是否启用：true-是，false-否
     */
    @TableField("is_active")
    private Boolean isActive;

    /**
     * 版本号，用于灰度发布或历史追溯
     */
    @TableField("version")
    private Integer version;

    /**
     * 是否为该项目的默认工作流
     */
    @TableField("is_default")
    private Boolean isDefault;

    /**
     * 创建人用户ID
     */
    @TableField("create_by")
    private Integer createBy;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private LocalDateTime createTime;

    /**
     * 最后更新时间，自动更新
     */
    @TableField("update_time")
    private LocalDateTime updateTime;
}