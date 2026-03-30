package com.example.demo.api.tb.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.domain.TaskFieldValues;
import com.example.demo.api.tb.domain.TaskFields;
import com.example.demo.api.tb.domain.TaskType;
import com.example.demo.api.tb.domain.dto.TaskFieldCreateDTO;
import com.example.demo.api.tb.domain.dto.TaskFieldUpdateDTO;
import com.example.demo.api.tb.domain.dto.TaskTypeCreateDTO;

import com.example.demo.api.tb.domain.dto.TaskTypeUpdateDTO;
import com.example.demo.api.tb.mapper.TaskFieldValuesMapper;
import com.example.demo.api.tb.mapper.TaskFieldsMapper;
import com.example.demo.api.tb.mapper.TaskTypeMapper;
import com.example.demo.api.tb.service.TaskTypeTemplateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;

@Service

public class TaskTypeTemplateServiceImpl implements TaskTypeTemplateService {

    @Autowired
    private TaskTypeMapper taskTypeMapper;

    @Autowired
    private TaskFieldsMapper taskFieldsMapper;

    @Autowired
    private TaskFieldValuesMapper taskFieldValuesMapper;


    //   保存任务类型
    @Override
    public void saveTaskType(TaskTypeCreateDTO taskTypeCreateDTO) {
        try {
            TaskType taskType = new TaskType();
            BeanUtil.copyProperties(taskTypeCreateDTO, taskType);
            taskTypeMapper.insert(taskType);
        } catch (Exception e) {
            // 记录异常日志并重新抛出
            throw new BusinessException(500, "保存任务类型失败", e);
        }
    }

    @Override
    public void updateTaskType(TaskTypeUpdateDTO taskTypeUpdateDTO) {
        // 检查是否存在
        TaskType taskType = taskTypeMapper.selectById(taskTypeUpdateDTO.getTaskTypeId());
        if (taskType == null) {
            throw new BusinessException(500, "任务类型不存在");
        }
        TaskType entity = new TaskType();
        entity.setId(taskTypeUpdateDTO.getTaskTypeId());
        BeanUtil.copyProperties(taskTypeUpdateDTO, entity);
        // 转换 Boolean -> tinyint (true → 1, false → 0)
        taskTypeMapper.updateById(entity);
    }

    @Override
    public void deleteTaskType(Long taskTypeId) {

        try {
            // 执行删除操作
            int result = taskTypeMapper.deleteById(taskTypeId);
            // 验证删除结果
            if (result == 0) {
                throw new RuntimeException("未找到对应的任务类型进行删除");
            }
        } catch (Exception e) {
            // 记录异常日志并重新抛出
            throw new RuntimeException("删除任务类型失败", e);
        }
    }

    @Override
    public void saveTaskTemplate(TaskFieldCreateDTO dto) {
        TaskFields field = new TaskFields();
        BeanUtil.copyProperties(dto, field);
        taskFieldsMapper.insert(field);
    }

    @Override
    public void updateTaskTemplate(TaskFieldUpdateDTO dto) {
        TaskFields oleTaskFields = taskFieldsMapper.selectOne(new LambdaQueryWrapper<TaskFields>().eq(TaskFields::getId, dto.getTaskFieldId()));
        //判断是否有值
        Long i = taskFieldValuesMapper.selectCount(new LambdaQueryWrapper<TaskFieldValues>()
                .eq(TaskFieldValues::getFieldId, dto.getTaskFieldId()));
        if (i > 0) {
            if (oleTaskFields.getType().equals(dto.getType())){
                throw new BusinessException(500, "字段类型已被引用,无法修改");
            }
        }

        // 创建实体对象并复制允许修改的属性

        TaskFields field = new TaskFields();
        BeanUtil.copyProperties(dto, field); // 排除 id 字段，避免被覆盖
        field.setId(dto.getTaskFieldId());
        taskFieldsMapper.updateById(field);
    }

    @Override
    public void deleteTaskTemplate(Long taskFieldId) {
        //判断是否有值
        Long i = taskFieldValuesMapper.selectCount(new LambdaQueryWrapper<TaskFieldValues>()
                .eq(TaskFieldValues::getFieldId, taskFieldId));
        if (i > 0) {
            throw new BusinessException(500, "该自定义字段已被引用,无法删除");
        }
        taskFieldsMapper.deleteById(taskFieldId);
    }


//    @Transactional
//    public void saveTaskTemplate(TaskTypeTemplateDTO dto) {
//
//        taskFieldsMapper.delete(new LambdaQueryWrapper<TaskFields>().eq(TaskFields::getTaskTypeId, dto.getTaskTypeId()));
//
//        // 参数校验
//        if (dto == null) {
//            throw new IllegalArgumentException("TaskTypeTemplateDTO cannot be null");
//        }
//        // 2. 保存 task_fields
//        if (dto.getFields() != null && !dto.getFields().isEmpty()) {
//            for (TaskFieldDTO fieldDTO : dto.getFields()) {
//                if (fieldDTO != null) {
//                    TaskFields field = new TaskFields();
//                    BeanUtil.copyProperties(fieldDTO, field);
//                    field.setTaskTypeId(dto.getTaskTypeId()); // 关联task_type的id
//                    int fieldResult = taskFieldsMapper.insert(field);
//                    if (fieldResult <= 0) {
//                        throw new RuntimeException("Failed to insert task field");
//                    }
//                }
//            }
//        }
//    }


    @Override
    public List<TaskFields> getTemplateFieldsByTaskTypeId(Long taskTypeId) {


        TaskType template = taskTypeMapper.selectById(taskTypeId);
        if (template == null) {
            throw new BusinessException("模板不存在，任务类型ID: " + taskTypeId);
        }

        // 3. 查询模板字段
        return taskFieldsMapper.selectList(new LambdaQueryWrapper<TaskFields>()
                .eq(TaskFields::getTaskTypeId, taskTypeId)
                .eq(TaskFields::getIsHidden, false)
                .orderByAsc(TaskFields::getSort, TaskFields::getCreateTime));
    }


    @Override
    public List<TaskType> getTaskTypeListByProjectId(Long projectId) {
        return taskTypeMapper.selectList(new LambdaQueryWrapper<TaskType>()
                        .in(TaskType::getProjectId, projectId, 0));
//                .eq(TaskType::getProjectId, projectId));

    }


    @Override
    public TaskType getTaskType(Long taskTypeId) {
        return taskTypeMapper.selectById(taskTypeId);
    }


}