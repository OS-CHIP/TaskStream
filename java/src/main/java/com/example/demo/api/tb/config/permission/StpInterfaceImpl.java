package com.example.demo.api.tb.config.permission;

import cn.dev33.satoken.stp.StpInterface;

import com.example.demo.api.tb.domain.Permission;

import com.example.demo.api.tb.domain.dto.PermissionDTO;
import com.example.demo.api.tb.service.PermissionService;


import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


/**
 * 自定义权限加载接口实现类
 */
@Component    // 保证此类被 SpringBoot 扫描，完成 Sa-Token 的自定义权限验证扩展
public class StpInterfaceImpl implements StpInterface {

    @Resource
    private PermissionService permissionService;

    @Resource
    private RedisTemplate redisTemplate;
    /**
     * 返回一个账号所拥有的权限码集合
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        //获取当前用户的项目id
        String keys = "loginId"+loginId;
        redisTemplate.opsForValue().set(keys,loginId);
        String  projectId =(String) redisTemplate.opsForValue().get(keys);

        //查询用户的权限
        PermissionDTO permissionDto = new PermissionDTO();
        permissionDto.setProjectId(Long.valueOf(projectId));
        List<Permission> permissions = permissionService.queryPermissionList(permissionDto);
        //获取权限标识符
        List<String> list = permissions.stream().map(permission -> {

            return permission.getPermission();
        }).collect(Collectors.toList());
        return list;
    }

    /**
     * 返回一个账号所拥有的角色标识集合 (权限与角色可分开校验)
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        return permissionService.getRoleList(loginId);
    }

}
