package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.io.Serializable;

/**
 * 用户角色表
 */
@Data
@TableName(value ="role_user")
public class RoleUser implements Serializable {

    /**
     * 角色ID
     */
    private Long roleId;
    /**
     * 用户ID
     */
    private Long userId;

    @TableField(exist = false)
    private static final long serialVersionUID = 1L;

}
