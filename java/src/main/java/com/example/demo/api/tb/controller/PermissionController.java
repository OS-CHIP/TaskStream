package com.example.demo.api.tb.controller;


import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.constant.ProjectConstants;
import com.example.demo.api.tb.domain.Permission;
import com.example.demo.api.tb.domain.dto.PermissionDTO;
import com.example.demo.api.tb.result.Result;
import com.example.demo.api.tb.service.PermissionService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 权限表(permission)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:17:18
 */
@RestController
@RequestMapping("permission")
public class PermissionController {

    /**
     * 服务对象
     */
    @Resource
    private PermissionService permissionService;



    /**
     * 通过项目id查询角色信息
     */
//    写法二：orRole = {"admin", "manager", "staff"}，代表具有三个角色其一即可。
    @GetMapping("hasRole/{userId}")
    public SaResult hasRole(@PathVariable("userId") Long userId) {
        //判断是否是超级管理员
        boolean isSuperAdmin = StpUtil.hasRole(userId, ProjectConstants.SUPER_ADMIN_ROLE_KEY);
        return SaResult.ok().setMsg(isSuperAdmin ? "是超级管理员" : "不是超级管理员");
    }













    /**
     * 查看项目下的角色的权限点集合
     */
    @PostMapping("queryPermissionList")
    public Result queryPermissionList(@RequestBody PermissionDTO permissionDto) {

        List<Permission> list = permissionService.queryPermissionList(permissionDto);
        return Result.ok(list);
    }


    /**
     * 查看项目下的角色的权限点集合
     */
    @GetMapping("queryPermissionTest")
    public Result test() {
// 获取：当前账号所拥有的权限集合
        StpUtil.getPermissionList();

// 判断：当前账号是否含有指定权限, 返回 true 或 false
        StpUtil.hasPermission("user.add");

// 校验：当前账号是否含有指定权限, 如果验证未通过，则抛出异常: NotPermissionException
        StpUtil.checkPermission("user.add");

// 校验：当前账号是否含有指定权限 [指定多个，必须全部验证通过]
        StpUtil.checkPermissionAnd("user.add", "user.delete", "user.get");

// 校验：当前账号是否含有指定权限 [指定多个，只要其一验证通过即可]
        StpUtil.checkPermissionOr("user.add", "user.delete", "user.get");

        List<String> permissionList = StpUtil.getPermissionList();
        // 获取：当前账号所拥有的角色集合
        StpUtil.getRoleList();

// 判断：当前账号是否拥有指定角色, 返回 true 或 false
        StpUtil.hasRole("super-admin");

// 校验：当前账号是否含有指定角色标识, 如果验证未通过，则抛出异常: NotRoleException
        StpUtil.checkRole("super-admin");

// 校验：当前账号是否含有指定角色标识 [指定多个，必须全部验证通过]
        StpUtil.checkRoleAnd("super-admin", "shop-admin");

// 校验：当前账号是否含有指定角色标识 [指定多个，只要其一验证通过即可]
        StpUtil.checkRoleOr("super-admin", "shop-admin");

        return Result.ok(permissionList);
    }


}

