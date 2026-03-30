package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.ProjectRole;
import com.example.demo.api.tb.domain.RoleUser;

import java.util.List;

/**
* @author ji156
* @description 针对表【user_role】的数据库操作Service
* @createDate 2025-02-17 16:01:13
*/
public interface RoleUserService extends IService<RoleUser> {


    void removeProjectUser(List<Long> roleIds, Long userId);
}

    
