package com.example.demo.api.tb.domain.vo;

import lombok.Data;


import java.io.Serializable;
import java.util.Set;

/**
 * 登录用户信息
 *
 * @author Michelle.Chung
 */
@Data
public class UserInfoVO implements Serializable {

    /**
     * 用户基本信息
     */
    private SysUserVO user;

    /**
     * 菜单权限
     */
    private Set<String> permissions;

    /**
     * 角色权限
     */
    private Set<String> roles;

}
