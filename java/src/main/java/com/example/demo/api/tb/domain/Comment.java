package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 评论实体类
 * 使用@Data注解自动生成getter/setter等方法
 * 使用@TableName注解将实体类与数据库表进行映射
 */
@TableName(value = "comment")
@Data
public class Comment implements Serializable {

    /**
     * 主键ID，唯一标识一条评论记录
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 任务ID，关联到具体的任务
     */
    @TableField(value = "task_id")
    private Long taskId;

    /**
     * 父级评论ID，用于实现树形结构
     */
    @TableField(value = "parent_id")
    private Long parentId;

    /**
     * 评论内容（支持Markdown）
     */
    @TableField(value = "content")
    private String content;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 创建人
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}
