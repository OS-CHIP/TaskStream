package com.example.demo.api.tb.domain.vo;


import lombok.Data;

/**
 * 项目成员 Value Object (VO) 类，用于封装项目成员的相关信息。
 */
@Data
public class ProjectMemberVO {
    private  Long id;
    private Long userId;
    private String email;       // 邮箱
    private String userName;   // 用户名称，对应 sys_user.user_name
    private String roleName;   // 角色名称，对应 roles.role_name

}