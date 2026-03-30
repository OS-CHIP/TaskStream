package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class TaskStaticsDTO {

    private Integer totalTasks;
    private Integer completedTasks;
    private Integer inProgressTasks;
}
