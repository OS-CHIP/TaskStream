package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * 更新日志实体类
 * @author ji156
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true) // 支持链式调用，如 new Task().setId(1).setTaskTitle("xxx")
@TableName("update_log")
public class UpdateLog {
    /**
     * 日志ID，主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 操作的表名
     */
    @TableField("table_name")
    private String tableName;

    /**
     * 操作记录的ID
     */
    @TableField("record_id")
    private Long recordId;

    /**
     * 被修改的字段名
     */
    @TableField("field_name")
    private String fieldName;

    /**
     * 修改前的值
     */
    @TableField("old_value")
    private String oldValue;

    /**
     * 修改后的值
     */
    @TableField("new_value")
    private String newValue;

    /**
     * 操作类型：INSERT, UPDATE, DELETE
     */
    @TableField("operation_type")
    private OperationType operationType;

    /**
     * 操作说明
     */
    @TableField("reason")
    private String reason;

    /**
     * 创建者
     */
    @TableField( value = "create_by",fill = FieldFill.INSERT)
    private Long createBy;


    /**
     * 操作时间
     */
    @TableField(value = "create_time",fill = FieldFill.INSERT)
    private Date createTime;

    // 枚举定义操作类型
    public enum OperationType {
        INSERT, UPDATE, DELETE ,TRANSFER
    }
}