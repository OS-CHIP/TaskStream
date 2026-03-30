package com.example.demo.api.tb.domain.vo;

import lombok.Data;

/**
 * 角色信息VO类，用于API响应
 */
@Data
public class RolesVO {
    private Long roleId;
    private String roleName;
}