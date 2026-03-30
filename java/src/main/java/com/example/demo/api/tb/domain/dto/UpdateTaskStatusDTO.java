package com.example.demo.api.tb.domain.dto;

import lombok.Data;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

@Data
public class UpdateTaskStatusDTO {

    @NotNull(message = "任务ID不能为空")
    private Long taskId;

    // @Min 和 @Max 可以校验数值范围
    private String status;

    @Min(value = 0, message = "进度不能小于0")
    @Max(value = 100, message = "进度不能大于100")
    private String completionPercentage;
}