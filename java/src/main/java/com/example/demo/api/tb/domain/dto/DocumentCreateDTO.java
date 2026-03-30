package com.example.demo.api.tb.domain.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;

import java.util.List;

/**
 * 创建文档请求 DTO
 */
@Data
public class DocumentCreateDTO {

    /**
     * 所属项目ID
     */
    @NotNull(message = "项目ID不能为空")
    private Long projectId;

    /**
     * 文档标题（必填）
     */
    @NotBlank(message = "文档标题不能为空")
    private String title;

    /**
     * 文档描述（可选）
     */
    private String description;

    /**
     * 文档类型（必填）
     */
    @NotBlank(message = "文档类型不能为空")
    @Pattern(
            regexp = "技术方案|需求文档|设计文档|测试文档|用户手册|项目计划|会议纪要|其他",
            message = "文档类型必须是：技术方案、需求文档、设计文档、测试文档、用户手册、项目计划、会议纪要、其他"
    )
    private String documentType;

    /**
     * 文档内容（必填）
     */
    @NotBlank(message = "文档内容不能为空")
    private String content;

    /**
     * 初始状态（默认 draft）
     */
    private String status = "draft";

    /**
     * 已上传的附件 ID 列表（前端先上传附件，再传 ID 绑定）
     * 前端调用 /api/upload 接口上传后，返回 attachment.id，再传入此处
     */
    private List<Long> attachmentIds;
}