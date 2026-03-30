package com.example.demo.api.tb.domain.dto;

import lombok.Data;
import java.util.List;

@Data
public class TaskOverviewDTO {

    private TaskStaticsDTO taskStatics;
    private List<StatusDTO> status;
    private List<PriorityDTO> priority;
}
