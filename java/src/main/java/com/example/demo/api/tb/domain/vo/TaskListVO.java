package com.example.demo.api.tb.domain.vo;

import com.example.demo.api.tb.domain.Task;
import com.example.demo.api.tb.domain.TaskRelation;
import lombok.Data;

import java.util.List;

@Data
public class TaskListVO {
    private List<Task> tasks;           // 所有涉及的任务
    private List<TaskRelation> relations; // 所有涉及的关系（去重）
}
