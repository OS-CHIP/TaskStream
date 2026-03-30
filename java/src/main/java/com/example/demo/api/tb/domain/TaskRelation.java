package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

/**
 * 任务关联关系实体类
 */
@Data
@TableName("task_relation")
public class TaskRelation {

    /**
     * 主键ID，自动递增
     */
    @TableId(type = IdType.AUTO)
    private Integer id;

    /**
     * 父任务ID
     */
    private Long parentTaskId;

    /**
     * 子任务ID
     */
    private Long childTaskId;

    /**
     * 关系类型（依赖/阻塞/包含/相关）
     */
    private String relationType;

    /**
     * 记录创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 创建人
     */
    @TableField(value = "create_by", fill = FieldFill.INSERT )
    private Long createBy;


    @TableField( "is_deleted")
    private Integer isDeleted;

    /**
     * 任务关系类型枚举
     */
    public enum TaskRelationType {
        DEPENDS_ON("DEPENDS_ON", "依赖于"),
        BLOCKS("BLOCKS", "阻塞"),
        INCLUDES("INCLUDES", "包含"),
        RELATES_TO("RELATES_TO", "相关"),
        TRANSFER( "TRANSFER", "转移");

        private final String code;
        private final String name;

        TaskRelationType(String code, String name) {
            this.code = code;
            this.name = name;
        }

        public String getName() {
            return name;
        }

        public String getCode() {
            return code;
        }
    }
}
