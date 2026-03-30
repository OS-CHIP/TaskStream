package com.example.demo.api.tb.service;

import com.example.demo.api.tb.domain.TaskFields;
import com.example.demo.api.tb.domain.TaskType;
import com.example.demo.api.tb.domain.dto.TaskFieldCreateDTO;
import com.example.demo.api.tb.domain.dto.TaskFieldUpdateDTO;
import com.example.demo.api.tb.domain.dto.TaskTypeCreateDTO;

import com.example.demo.api.tb.domain.dto.TaskTypeUpdateDTO;

import javax.validation.Valid;
import java.util.List;

public interface TaskTypeTemplateService {

    


    TaskType getTaskType(Long taskTypeId);

    List<TaskFields> getTemplateFieldsByTaskTypeId(Long taskTypeId);


    List<TaskType> getTaskTypeListByProjectId(Long projectId);


    void saveTaskType(TaskTypeCreateDTO taskTypeCreateDTO);

    void updateTaskType(@Valid TaskTypeUpdateDTO taskTypeUpdateDTO);

    void deleteTaskType(Long taskTypeId);


    

    void updateTaskTemplate(@Valid TaskFieldUpdateDTO dto);

    void deleteTaskTemplate(Long taskFieldId);

    void saveTaskTemplate(@Valid TaskFieldCreateDTO dto);
}
