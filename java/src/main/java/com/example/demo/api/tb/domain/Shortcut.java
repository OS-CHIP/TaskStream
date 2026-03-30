package com.example.demo.api.tb.domain;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import lombok.Data;

/**
 *  创建捷径表
 * @TableName shortcut
 */
@TableName(value ="shortcut")
@Data
public class Shortcut implements Serializable {
    /**
     * 
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 
     */
    @TableField(value = "name")
    private String name;

    /**
     * 
     */
    @TableField(value = "path")
    private String path;

    /**
     * 
     */
    @TableField(value = "project_id")
    private Long projectId;

    /**
     * 
     */
    @TableField(value = "user_id")
    private Long userId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}