package com.example.demo.api.tb.controller;

import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.domain.vo.WorkflowInstanceDetailResp;
import com.example.demo.api.tb.service.WorkflowService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("workflow")
public class WorkflowController {

    @Autowired
    private WorkflowService workflowService;

    // 创建任务时自动启动流程
    @PostMapping("/task/{taskId}/start")
    public SaResult startTaskWorkflow(@PathVariable Integer taskId, @RequestParam Integer userId) {
        workflowService.startWorkflow("task", taskId, userId);
        return SaResult.ok();
    }

    /**
     * 获取流程实例详情（含当前节点、可操作按钮、历史）
     */
    @GetMapping("/instance/{instanceId}")
    public SaResult getInstanceDetail(@PathVariable Integer instanceId) {
        WorkflowInstanceDetailResp detail = workflowService.getInstanceDetail(instanceId);
        return SaResult.ok().setData(detail);
    }

//    // 执行审批
//    @PostMapping("/instance/{instanceId}/execute")
//    public SaResult execute(
//            @PathVariable Integer instanceId,
//            @RequestParam Integer operatorId,
//            @RequestParam String action, // "approve", "reject"
//            @RequestParam(required = false) String comment
//    ) {
//        workflowService.executeTransition(instanceId, operatorId, action, comment);
//        return SaResult.ok();
//    }
}