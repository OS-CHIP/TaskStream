package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public  class MarkReadDTO {
    @NotNull(message = "类型不能为空")
    private Integer type; // 1 or 2
    @NotNull(message = "ID不能为空")
    private Long id;
}