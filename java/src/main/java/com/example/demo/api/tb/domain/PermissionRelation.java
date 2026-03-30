package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * 
 * @TableName permission_relation
 */
@TableName(value ="permission_relation")
@Data
public class PermissionRelation implements Serializable {
    /**
     * 
     */
    @TableId
    private Long id;

    /**
     * 
     */
    private Long roleId;

    /**
     * 
     */
    private Long permissionId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}