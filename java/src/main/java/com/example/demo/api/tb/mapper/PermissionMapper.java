package com.example.demo.api.tb.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.Permission;

import java.util.ArrayList;
import java.util.List;

/**
* @author ji156
* @description 针对表【permission】的数据库操作Mapper
* @createDate 2025-02-17 15:35:49
* @Entity generator.domain.Permission
*/
public interface PermissionMapper extends BaseMapper<Permission> {

    ArrayList<Permission> queryPermissionListByRoleId(Long roleId);
    //查询该用户有多少个角色
    List<String> getRoleList(Object loginId);
}




