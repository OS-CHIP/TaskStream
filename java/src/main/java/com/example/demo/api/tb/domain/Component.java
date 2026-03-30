package com.example.demo.api.tb.domain;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import java.io.Serializable;
import java.util.Date;

import lombok.Data;

/**
 * 
 * @TableName component
 */
@TableName(value ="component")
@Data
public class Component implements Serializable {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * 组件显示名称，如：下拉选择框
     */
    @TableField(value = "label")
    private String label;

    /**
     * 组件唯一标识，如：select、input、date-picker
     */
    @TableField(value = "component_key")
    private String componentKey;

    /**
     * 是否需要操作列（如编辑/删除按钮），0-否，1-是
     */
    @TableField(value = "has_action_buttons")
    private Boolean hasActionButtons;

    /**
     * 组件默认属性配置（JSON格式，如 { "multiple": true, "placeholder": "请选择" }）
     */
    @TableField(value = "props_config")
    private String propsConfig;

    @TableField(value = "create_time")
    private Date createTime;

    @TableField(value = "update_time")
    private Date updateTime;
}

