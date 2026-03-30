package com.example.demo.api.tb.domain.dto;

import com.example.demo.api.tb.domain.TaskFieldValues;
import com.example.demo.api.tb.domain.Task;
import lombok.Data;

import java.util.ArrayList;

@Data
public class FieldValuesDTO {


    private Task tasks;

    private   ArrayList<TaskFieldValues> fieldValuesList;
}
