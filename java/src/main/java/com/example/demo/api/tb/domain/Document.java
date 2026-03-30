package com.example.demo.api.tb.domain;


import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * 文档实体类
 * 对应数据库表：document
 */
@Data
@Accessors(chain = true)
@TableName("document")
public class Document {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 所属项目ID
     */
    @TableField(value = "project_id")
    private Long projectId;

    /**
     * 文档标题（必填）
     */
    private String title;

    /**
     * 文档描述（可选）
     */
    private String description;

    /**
     * 文档类型（如：技术方案、需求文档等）
     */
    private String documentType;

    /**
     * 文档内容（富文本，HTML 或 Markdown）
     */
    private String content;

    /**
     * 文档状态：draft / published / archived
     */
    private String status;

    /**
     * 创建人ID（Sa-Token 登录用户ID）
     */
    @TableField(fill = FieldFill.INSERT)
    private Long createBy;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;

    /**
     * 逻辑删除标志：0=正常，1=已删除
     */
    @TableLogic
    private Integer isDeleted;
}