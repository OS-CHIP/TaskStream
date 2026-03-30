package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.Permission;
import com.example.demo.api.tb.domain.dto.PermissionDTO;

import java.util.List;

/**
* @author ji156
* @description 针对表【permission】的数据库操作Service
* @createDate 2025-02-17 15:35:49
*/
public interface PermissionService extends IService<Permission> {


    List<Permission> queryPermissionList(PermissionDTO permissionDto);

    List<String> getRoleList(Object loginId);
}
