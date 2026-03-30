package com.example.demo.api.tb.domain;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 * 
 * @TableName task_field_values
 */
@TableName(value ="task_field_values")
@Data
public class TaskFieldValues implements Serializable {
    /**
     * 
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 
     */
    @TableField(value = "tasks_id")
    private Long tasksId;

    /**
     * 
     */
    @TableField(value = "field_id")
    private Long fieldId;

    /**
     * 
     */
    @TableField(value = "value")
    private String value;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}