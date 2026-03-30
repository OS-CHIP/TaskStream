package com.example.demo.api.tb.domain.dto;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.Date;
import java.util.List;

/**
 * 创建文档请求 DTO
 */
@Data
public class CommentCreateDTO {

    /**
     * 主键ID，唯一标识一条评论记录
     */
    private Long id;

    /**
     * 任务ID，关联到具体的任务
     */
    private Long taskId;

    /**
     * 父级评论ID，用于实现树形结构
     */
    private Long parentId;

    /**
     * 评论内容（支持Markdown）
     */
    private String content;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 创建人
     */
    private Long createBy;
    /**
     * 修改时间
     */
    private Date updateTime;

}