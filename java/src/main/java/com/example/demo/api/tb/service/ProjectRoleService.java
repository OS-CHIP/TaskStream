package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.ProjectRole;

/**
* @author ji156
* @description 针对表【project_role】的数据库操作Service
* @createDate 2025-02-17 16:01:05
*/
public interface ProjectRoleService extends IService<ProjectRole> {
    /**
     * 保存项目角色用户表
     * @param projectId
     * @param roleId
     */
    void saveProjectRole(Long projectId, Long roleId);
}
