package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.Workflow;
import com.example.demo.api.tb.domain.vo.WorkflowInstanceDetailResp;

/**
* @author ji156
* @description 针对表【workflow】的数据库操作Service
* @createDate 2025-02-10 17:01:27
*/
public interface WorkflowService extends IService<Workflow> {

    void startWorkflow(String task, Integer taskId, Integer userId);

    WorkflowInstanceDetailResp getInstanceDetail(Integer instanceId);
}
