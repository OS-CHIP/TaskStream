package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.SysUser;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
* @author ji156
* @description 针对表【users(用户信息表)】的数据库操作Mapper
* @createDate 2025-02-10 17:01:25
* @Entity com.example.demo.api.tb.domain.Users
*/
@Mapper
public interface UserMapper extends BaseMapper<SysUser> {

    List<SysUser> queryUsersByRole(RolesDTO rolesDto);


}




