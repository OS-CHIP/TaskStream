package com.example.demo.api.tb.domain.vo;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class WorkflowInstanceDetailResp {
    private Integer instanceId;
    private String workflowName;
    private String businessType;
    private Integer businessId;
    private String currentStatus;          // running / completed / terminated
    private String currentNodeName;
    private LocalDateTime createTime;
    private LocalDateTime endTime;
    private List<TransitionOptionResp> availableActions;
    private List<WorkflowHistoryResp> historyList;
}