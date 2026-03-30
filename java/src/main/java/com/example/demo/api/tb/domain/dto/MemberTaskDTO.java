package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class MemberTaskDTO {

    private String taskTitle;
    private Integer status;
    private Integer priority;
}