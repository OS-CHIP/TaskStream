package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class WorkflowCreateDTO {
    @NotBlank(message = "流程名称不能为空")
    private String name;

    @NotBlank(message = "流程编码不能为空")
    private String code; // 如 TASK_APPROVAL_V2

    private String description;

    @NotNull(message = "节点列表不能为空")
    private List<NodeDto> nodes;

    @NotNull(message = "流转规则列表不能为空")
    private List<TransitionDto> transitions;

    @Data
    public static class NodeDto {
        private Integer id; // 前端可不传，后端生成
        @NotBlank private String name;
        private Boolean isStart = false;
        private Boolean isEnd = false;
        private String handlerType; // assignee / role / dept / auto
        private String assigneeValue; // 具体用户ID/角色code等
    }

    @Data
    public static class TransitionDto {
        private Integer id;
        @NotNull private Integer fromNodeId;
        @NotNull private Integer toNodeId;
        private String name; // 显示名称，如“同意”
        private String actionType = "normal"; // normal / rollback / jump
        private String conditionExpr; // 表达式，如 ${task.priority} == 'high'
        private Integer sortOrder = 0;
    }
}
