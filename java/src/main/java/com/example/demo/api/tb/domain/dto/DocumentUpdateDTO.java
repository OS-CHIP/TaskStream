package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import java.util.ArrayList;


@Data
public class DocumentUpdateDTO {

    @NotNull(message = "文档ID不能为空")
    private Long id;

    @NotBlank(message = "标题不能为空")
    private String title;

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
     * 文档内容（富文本，HTML 或 Markdown）
     */
    @NotBlank(message = "文档内容不能为空")
    private String content;

    @NotBlank(message = "状态不能为空")
    private String status;

    private Long projectId;
    // 新增：附件ID列表（可为空，表示清空附件）
    private ArrayList<Long> attachmentIds;
}