package com.example.demo.api.tb.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Permission;
import com.example.demo.api.tb.domain.Roles;
import com.example.demo.api.tb.domain.dto.PermissionDTO;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import com.example.demo.api.tb.mapper.PermissionMapper;
import com.example.demo.api.tb.service.PermissionService;
import com.example.demo.api.tb.service.RolesService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
* @author ji156
* @description 针对表【permission】的数据库操作Service实现
* @createDate 2025-02-17 15:35:49
*/
@Service
public class PermissionServiceImpl extends ServiceImpl<PermissionMapper, Permission>
    implements PermissionService {
    @Resource
    private PermissionMapper permissionMapper;
    @Resource
    private RolesService rolesService;
    @Override
    public List<Permission> queryPermissionList(PermissionDTO permissionDto) {

        //根据userId,projectId查询角色信息
        RolesDTO rolesDto = new RolesDTO();
        BeanUtils.copyProperties(permissionDto,rolesDto);
        Roles role =  rolesService.queryRoleByuserIdAndprojectId(rolesDto);

        //根据角色id查询角色权限
        ArrayList<Permission> permissionList = permissionMapper.queryPermissionListByRoleId(role.getRoleId());

        return permissionList;
    }


    //查询该用户有多少个角色
    @Override
    public List<String> getRoleList(Object loginId) {
        return permissionMapper.getRoleList(loginId);
    }
}




