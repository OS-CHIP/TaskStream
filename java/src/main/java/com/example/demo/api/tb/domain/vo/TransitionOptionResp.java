package com.example.demo.api.tb.domain.vo;// dto/response/TransitionOptionResp.java


import lombok.Data;

@Data
public class TransitionOptionResp {
    private Integer transitionId;
    private String name;           // 显示名称，如“同意”、“驳回”
    private String actionType;     // normal / rollback / jump
}