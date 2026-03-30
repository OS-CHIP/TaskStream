package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.Roles;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
* @author ji156
* @description 针对表【roles(角色信息表)】的数据库操作Mapper
* @createDate 2025-02-10 17:00:35
* @Entity com.example.demo.api.tb.domain.Roles
*/
@Mapper
public interface RolesMapper extends BaseMapper<Roles> {


    List<Roles> queryProjectRoles(Long projectId);


    Roles queryRoleByuserIdAndprojectId(@Param("userId") long userId,@Param("projectId") Long projectId);
}




