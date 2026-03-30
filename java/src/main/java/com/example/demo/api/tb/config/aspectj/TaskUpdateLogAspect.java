package com.example.demo.api.tb.config.aspectj;

import cn.hutool.core.bean.BeanUtil;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.domain.Task;
import com.example.demo.api.tb.domain.UpdateLog;
import com.example.demo.api.tb.domain.dto.TaskCreateDTO;
import com.example.demo.api.tb.mapper.TaskMapper;
import com.example.demo.api.tb.mapper.UpdateLogMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @author ji156
 */
@Aspect
@Component
public class TaskUpdateLogAspect {


    @Autowired
    private TaskMapper taskMapper; // 用于查询旧数据

    @Autowired
    private UpdateLogMapper updateLogMapper; // 用于保存日志

    // 切入点：拦截 updateTask 方法，参数为 Task 对象
    @Pointcut("execution(* com.example.demo.api.tb.service.TaskService.updateTask(..)) && args(newTask)")
    public void updateTaskPointcut(TaskCreateDTO newTask) {}

    @Pointcut("execution(* com.example.demo.api.tb.service.TaskService.createTask(..)) && args(taskCreateDTO)")
    public void saveTaskPointcut(TaskCreateDTO taskCreateDTO) {}

    /**
     * 在 createTask 方法执行成功后触发
     */
    @AfterReturning("saveTaskPointcut(taskCreateDTO)")
    public void logTaskCreate(TaskCreateDTO taskCreateDTO) {
        UpdateLog log = new UpdateLog();
        log.setTableName("task");
        log.setRecordId(taskCreateDTO.getId());
        log.setOperationType(UpdateLog.OperationType.INSERT);
        updateLogMapper.insert(log);
    }

    // 环绕通知
    @Around("updateTaskPointcut(newTask)")
    public Object logTaskUpdate(ProceedingJoinPoint joinPoint, TaskCreateDTO newTask) throws Throwable {

        Long id = newTask.getId();
        if (id == null) {
            throw new BusinessException(500, "id 不能为空");
        }

        // 2. 查询旧数据
        Task task = taskMapper.selectById(id);
        TaskCreateDTO oldTask = new TaskCreateDTO();
        BeanUtil.copyProperties(task , oldTask);


        if (oldTask == null) {
           throw  new BusinessException(500, "旧数据不存在");
        }

        // 3. 调用原方法（即执行实际的 updateTask 逻辑）
        Object result = joinPoint.proceed(); // 执行目标方法，即 service.updateTask(newTask)

        // 4. 原方法执行成功后，再记录变更日志
        if (oldTask != null) {  // 避免 null 异常
            List<UpdateLog> logs = compareFieldsAndGenerateLogs(
                    "task",
                    id,
                    oldTask,
                    newTask,
                    new String[]{"priority", "assignee", "description", "status", "assigner", "dueDate", "startTime", "parentId", "attachmentIds", "taskTitle", "projectId", "taskTypeId", "estimatedHours","completionPercentage"}
            );

            if (!logs.isEmpty()) {
                for (UpdateLog log : logs) {
                    updateLogMapper.insert(log);
                }
            }
        }

        // 5. 返回原方法的结果
        return result;
    }

    /**
     * 反射比较对象的指定字段，生成 UpdateLog 列表
     */
    /**
     * 比较两个对象的指定字段值，生成变更日志记录
     *
     * @param tableName 表名，用于记录日志
     * @param recordId 记录ID，用于标识具体哪条记录发生了变更
     * @param oldObj 旧对象，包含变更前的字段值
     * @param newObj 新对象，包含变更后的字段值
     * @param watchedFields 需要监控的字段数组
     * @return 返回字段变更日志列表，如果无变更则返回空列表
     * @throws IllegalAccessException 当无法访问对象字段时抛出此异常
     */
    private List<UpdateLog> compareFieldsAndGenerateLogs(
            String tableName,
            Long recordId,
            Object oldObj,
            Object newObj,
            String[] watchedFields) throws IllegalAccessException {

        List<UpdateLog> logs = new ArrayList<>();

        Class<?> clazz = oldObj.getClass();
        Field[] fields = clazz.getDeclaredFields();

        // 遍历对象的所有字段，检查指定字段的值是否发生变化
        for (Field field : fields) {
            String fieldName = field.getName();

            // 只监听我们关心的字段
            boolean shouldWatch = false;
            for (String watchedField : watchedFields) {
                if (watchedField.equals(fieldName)) {
                    shouldWatch = true;
                    break;
                }
            }
            if (!shouldWatch) {
                continue;
            }

            field.setAccessible(true);
            Object oldValue = field.get(oldObj);
            Object newValue = field.get(newObj);

            // 判断字段值是否真的发生了变化
            boolean isDifferent = (oldValue == null && newValue != null) ||
                    (oldValue != null && !oldValue.equals(newValue) && newValue != null);

            // 如果字段值发生变化，则生成变更日志记录
            if (isDifferent) {
                UpdateLog log = new UpdateLog();
                log.setTableName(tableName);
                log.setRecordId(recordId);
                log.setFieldName(fieldName);
                log.setOldValue(oldValue != null ? oldValue.toString() : null);
                log.setNewValue(newValue != null ? newValue.toString() : null);
                log.setOperationType(UpdateLog.OperationType.UPDATE);
                // 设置描述信息
                logs.add(log);
            }
        }

        return logs;
    }

}