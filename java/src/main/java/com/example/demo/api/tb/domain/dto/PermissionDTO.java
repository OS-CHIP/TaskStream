package com.example.demo.api.tb.domain.dto;

import lombok.Data;

@Data
public class PermissionDTO {

    /**
     * 项目id
     */
    private Long projectId;
    /**
     * 角色id
     */
    private Long roleId;
    /**
     * 用户id
     */
    private Long userId;



}
