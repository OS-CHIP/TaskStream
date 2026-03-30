package com.example.demo.api.tb.domain.vo;
// dto/response/WorkflowHistoryResp.java


import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkflowHistoryResp {
    private String fromNodeName;   // null 表示流程开始
    private String toNodeName;
    private String operatorName;   // 操作人姓名
    private String action;
    private String comment;
    private LocalDateTime operateTime;
}