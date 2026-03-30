package  com.example.demo.api.tb.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.domain.*;
import com.example.demo.api.tb.domain.vo.TransitionOptionResp;
import com.example.demo.api.tb.domain.vo.WorkflowHistoryResp;
import com.example.demo.api.tb.domain.vo.WorkflowInstanceDetailResp;
import com.example.demo.api.tb.mapper.*;
import com.example.demo.api.tb.service.TaskService;
import  com.example.demo.api.tb.service.WorkflowService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
* @author ji156
* @description 针对表【workflow】的数据库操作Service实现
* @createDate 2025-02-10 17:01:27
*/
@Service
@Slf4j
public class WorkflowServiceImpl extends ServiceImpl<WorkflowMapper, Workflow>
    implements WorkflowService{


    @Resource
    private WorkflowInstanceMapper instanceMapper;
    @Resource
    private WorkflowHistoryMapper historyMapper;
    @Resource
    private WorkflowNodeMapper nodeMapper;
    @Resource
    private WorkflowTransitionMapper transitionMapper;
    @Resource
    private WorkflowMapper workflowMapper;

    @Resource
    private TaskService taskService;

    /**
     * 启动工作流实例
     */
    @Override
    @Transactional
    public void startWorkflow(String businessType, Integer businessId, Integer userId) {
        // 1. 获取默认工作流（简化：按 project_id 或 code 查询，此处固定 workflowId=1）
        Workflow workflow = workflowMapper.selectOne(
                new QueryWrapper<Workflow>()
                        .eq("code", "TASK_APPROVAL_V1")
                        .eq("is_active", 1)
                        .orderByDesc("version")
                        .last("LIMIT 1")
        );
        if (workflow == null) {
            throw new BusinessException("未找到可用的工作流模板");
        }

        // 2. 获取开始节点
        WorkflowNode startNode = nodeMapper.selectOne(
                new QueryWrapper<WorkflowNode>()
                        .eq("workflow_id", workflow.getId())
                        .eq("is_start", 1)
        );
        if (startNode == null) {
            throw new BusinessException("工作流缺少开始节点");
        }

        // 3. 创建实例
        WorkflowInstance instance = new WorkflowInstance();
        instance.setWorkflowId(workflow.getId());
        instance.setBusinessType(businessType);
        instance.setBusinessId(businessId);
        instance.setCurrentNodeId(startNode.getId());
        instance.setStatus("running");
        instance.setCreateTime(LocalDateTime.now());
        instanceMapper.insert(instance);

        // 4. 记录历史（from_node_id = null 表示启动）
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(instance.getId());
        history.setToNodeId(startNode.getId());
        history.setOperatorId(userId);
        history.setAction("create");
        history.setComment("流程启动");
        history.setOperateTime(LocalDateTime.now());
        historyMapper.insert(history);
    }

    /**
     * 执行流转操作（审批/驳回等）
     */
//    @Override
    @Transactional
    public void executeTransition(Integer instanceId, Integer operatorId, String action, String comment) {
        WorkflowInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException("流程实例不存在");
        }
        if (!"running".equals(instance.getStatus())) {
            throw new BusinessException("流程已结束，无法操作");
        }

        Integer currentNodeId = instance.getCurrentNodeId();

        // 获取业务上下文（用于条件表达式）
        Map<String, Object> context = buildBusinessContext(instance.getBusinessType(), instance.getBusinessId());

        // 查找所有从当前节点出发的流转
        List<WorkflowTransition> transitions = transitionMapper.selectList(
                new QueryWrapper<WorkflowTransition>()
                        .eq("from_node_id", currentNodeId)
                        .orderByAsc("sort_order")
        );

        WorkflowTransition matched = null;
        for (WorkflowTransition t : transitions) {
            // 简化匹配逻辑：action 名称或类型匹配 + 条件成立
            boolean actionMatch = isActionMatch(t, action);
            boolean conditionPass = evaluateCondition(t.getConditionExpr(), context);
            if (actionMatch && conditionPass) {
                matched = t;
                break;
            }
        }

        if (matched == null) {
            throw new BusinessException("当前操作无匹配的流转规则，请检查配置");
        }

        // 更新实例状态
        instance.setCurrentNodeId(matched.getToNodeId());
        WorkflowNode toNode = nodeMapper.selectById(matched.getToNodeId());
        if (toNode != null && toNode.getIsEnd() == true) {
            instance.setStatus("completed");
            instance.setEndTime(LocalDateTime.now());
        }
        instanceMapper.updateById(instance);

        // 记录历史
        WorkflowHistory history = new WorkflowHistory();
        history.setInstanceId(instanceId);
        history.setFromNodeId(currentNodeId);
        history.setToNodeId(matched.getToNodeId());
        history.setOperatorId(operatorId);
        history.setAction(action);
        history.setComment(StrUtil.blankToDefault(comment, ""));
        history.setOperateTime(LocalDateTime.now());
        historyMapper.insert(history);

        log.info("流程实例 {} 执行操作: {} -> {}", instanceId, currentNodeId, matched.getToNodeId());
    }

    /**
     * 获取流程实例详情（含可操作项和历史）
     */
    @Override
    public WorkflowInstanceDetailResp getInstanceDetail(Integer instanceId) {
        WorkflowInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException("流程实例不存在");
        }

        Workflow workflow = workflowMapper.selectById(instance.getWorkflowId());
        WorkflowNode currentNode = nodeMapper.selectById(instance.getCurrentNodeId());

        WorkflowInstanceDetailResp resp = new WorkflowInstanceDetailResp();
        resp.setInstanceId(instance.getId());
        resp.setWorkflowName(workflow != null ? workflow.getName() : "未知流程");
        resp.setBusinessType(instance.getBusinessType());
        resp.setBusinessId(instance.getBusinessId());
        resp.setCurrentStatus(instance.getStatus());
        resp.setCurrentNodeName(currentNode != null ? currentNode.getName() : "未知节点");
        resp.setCreateTime(instance.getCreateTime());
        resp.setEndTime(instance.getEndTime());

        // 可用操作
        Map<String, Object> context = buildBusinessContext(instance.getBusinessType(), instance.getBusinessId());
        List<WorkflowTransition> transitions = transitionMapper.selectList(
                new QueryWrapper<WorkflowTransition>()
                        .eq("from_node_id", instance.getCurrentNodeId())
                        .orderByAsc("sort_order")
        );
        resp.setAvailableActions(transitions.stream()
                .filter(t -> evaluateCondition(t.getConditionExpr(), context))
                .map(t -> {
                    TransitionOptionResp opt = new TransitionOptionResp();
                    opt.setTransitionId(t.getId());
                    opt.setName(StrUtil.blankToDefault(t.getName(), "下一步"));
                    opt.setActionType(t.getActionType());
                    return opt;
                })
                .collect(Collectors.toList()));

        // 历史记录
        List<WorkflowHistory> histories = historyMapper.selectList(
                new QueryWrapper<WorkflowHistory>()
                        .eq("instance_id", instanceId)
                        .orderByAsc("operate_time")
        );
        resp.setHistoryList(histories.stream().map(h -> {
            WorkflowHistoryResp hr = new WorkflowHistoryResp();
            hr.setFromNodeName(h.getFromNodeId() != null ? getNodeName(h.getFromNodeId()) : null);
            hr.setToNodeName(getNodeName(h.getToNodeId()));
            hr.setOperatorName(StpUtil.getExtra("username").toString());
            hr.setAction(h.getAction());
            hr.setComment(h.getComment());
            hr.setOperateTime(h.getOperateTime());
            return hr;
        }).collect(Collectors.toList()));

        return resp;
    }

    // ---------------- 辅助方法 ----------------

    private boolean isActionMatch(WorkflowTransition t, String action) {
        if (StrUtil.isBlank(action)) return false;
        // 精确匹配 name（如“同意”、“驳回”）
        if (action.equals(t.getName())) return true;
        // 类型匹配：approve → normal, reject → rollback
        if ("approve".equalsIgnoreCase(action) && "normal".equals(t.getActionType())) return true;
        if ("reject".equalsIgnoreCase(action) && "rollback".equals(t.getActionType())) return true;
        return false;
    }

    private boolean evaluateCondition(String expr, Map<String, Object> context) {
        if (StrUtil.isBlank(expr)) return true;

        // 示例：支持 ${task.priority} == "high"
        if (expr.contains("${task.priority}")) {
            Object priority = context.get("priority");
            if (expr.contains("== \"high\"")) {
                return "high".equals(priority);
            }
        }

        // TODO: 可集成 Spring EL 或 QLExpress 实现通用表达式引擎
        return true; // 默认通过（生产环境建议完善）
    }

    private Map<String, Object> buildBusinessContext(String businessType, Integer businessId) {
        Map<String, Object> ctx = new HashMap<>();
        if ("task".equals(businessType)) {
           Task task = taskService.getById(businessId);
            if (task != null) {
                ctx.put("priority", task.getPriority());
                ctx.put("creator", task.getCreateBy());
            }
        }
        // 可扩展 defect / requirement
        return ctx;
    }

    private String getNodeName(Integer nodeId) {
        if (nodeId == null) return null;
        WorkflowNode node = nodeMapper.selectById(nodeId);
        return node != null ? node.getName() : "未知节点";
    }
}




