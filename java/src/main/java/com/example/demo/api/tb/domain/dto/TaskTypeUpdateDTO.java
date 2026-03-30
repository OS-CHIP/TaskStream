package com.example.demo.api.tb.domain.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class TaskTypeUpdateDTO {
    @NotNull(message = "任务类型ID不能为空")
    private Long taskTypeId;

    private String name;

    private String description;

    private Integer projectId; // null 表示全局模板

    private Boolean isHidden; // true 表示显示，false 表示隐藏（对应 is_hidden: 1=显示, 0=隐藏）
}