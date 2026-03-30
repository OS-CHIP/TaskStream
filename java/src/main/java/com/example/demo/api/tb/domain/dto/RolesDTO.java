package com.example.demo.api.tb.domain.dto;
import lombok.Data;

@Data
public class RolesDTO {



    /**
     * 角色名称
     */
    private String roleName;
    /**
     * 角色描述
     */
    private String remark;
    /**
     * 项目id
     */
    private Long projectId;
    /**
     * 角色id
     */
    private Long roleId;




}
