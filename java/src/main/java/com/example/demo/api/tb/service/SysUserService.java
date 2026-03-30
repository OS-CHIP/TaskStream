package com.example.demo.api.tb.service;

import com.example.demo.api.tb.domain.SysUser;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import com.example.demo.api.tb.domain.dto.RegisterDTO;
import com.example.demo.api.tb.domain.vo.SysUserVO;

import java.util.List;

/**
* @author ji156
* @description 针对表【users(用户信息表)】的数据库操作Service
* @createDate 2025-02-10 17:01:25
*/
public interface SysUserService extends IService<SysUser> {

    List<SysUser> queryUsersByRole(RolesDTO rolesDto);

    void register(RegisterDTO registerBody);

    SysUserVO selectUserById(Long loginId);

    int resetUserPwd(Long loginIdAsLong, String hashpw);

    SysUser selectUserInfoByNameOrEmail(String userNameOrEmail);
}
