package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import java.util.List;

@Data
public class MemberInfoDTO {
    private String userName;
    private TaskStaticsDTO taskStatics;
    private List<MemberTaskDTO> memberTasks;
}
