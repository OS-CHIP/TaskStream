package com.example.demo.api.tb.service.impl;


import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.ProjectRole;
import com.example.demo.api.tb.mapper.ProjectRoleMapper;
import com.example.demo.api.tb.service.ProjectRoleService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
* @author ji156
* @description 针对表【project_role】的数据库操作Service实现
* @createDate 2025-02-17 16:01:05
*/
@Service
public class ProjectRoleServiceImpl extends ServiceImpl<ProjectRoleMapper, ProjectRole>
    implements ProjectRoleService {
    @Resource
    private ProjectRoleMapper projectRoleMapper;
    @Override
    public void saveProjectRole(Long projectId, Long roleId) {
        ProjectRole projectRole = new ProjectRole();
        projectRole.setProjectId(projectId);
        projectRole.setRoleId(roleId);
        projectRoleMapper.insert(projectRole);
    }
}




