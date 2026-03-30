package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 任务类型实体类
 * @TableName task_type
 */
@TableName(value = "task_type")
@Data
public class TaskType implements Serializable {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 类型名称
     */
    @TableField // value = "name" 可省略，默认匹配字段名
    private String name;

    /**
     * 描述信息
     */
    @TableField // value = "description"
    private String description;

    /**
     * 所属项目ID
     */
    @TableField(value = "project_id")
    private Long projectId;

    /**
     * 是否隐藏：0-隐藏，1-true-显示
     */
    @TableField(value = "is_hidden")
    private Boolean isHidden;


    /**
     * 创建人ID
     */
    @TableField(value = "create_by", fill = FieldFill.INSERT)
    private Long createBy;

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

    /**
     * 逻辑删除 默认是 0
     */
    @TableField(value = "is_deleted")
    @TableLogic
    private Integer isDeleted;

    /**
     * 序列化版本标识
     */
    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
