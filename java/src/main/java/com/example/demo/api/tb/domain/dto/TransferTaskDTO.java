package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data

public class TransferTaskDTO {
    @NotBlank( message = "指派人不能为空")
    private String assignee;   // 新执行人ID
    @NotBlank( message = "转单原因不能为空")
    private String reason;     // 转单原因
    @NotNull( message = "任务ID不能为空")
    private Long taskId;    // 任务ID
    @NotNull( message = "项目ID不能为空")
    private Long projectId;
}