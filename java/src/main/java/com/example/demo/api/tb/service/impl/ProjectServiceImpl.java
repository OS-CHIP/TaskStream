package com.example.demo.api.tb.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.constant.ProjectConstants;
import com.example.demo.api.tb.domain.*;
import com.example.demo.api.tb.domain.dto.AgreeCreateSubProjectDTO;
import com.example.demo.api.tb.domain.dto.ProjectDTO;
import com.example.demo.api.tb.domain.enums.ApprovalStatus;
import com.example.demo.api.tb.domain.vo.ProjectMemberVO;
import com.example.demo.api.tb.domain.vo.ProjectVO;
import com.example.demo.api.tb.mapper.ProjectMapper;
import com.example.demo.api.tb.mapper.TaskMapper;
import com.example.demo.api.tb.service.*;
import com.example.demo.api.tb.utils.ObjectUtils;
import com.example.demo.api.tb.utils.tree.TreeBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * @author ji156
 * @description 针对表【project】的数据库操作Service实现
 * @createDate 2025-02-10 17:00:28
 */
@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project>
        implements ProjectService {


    @Resource
    private ProjectMapper projectMapper;

    @Resource
    private ProjectRoleService projectRoleService;

    @Resource
    private RoleUserService roleUserService;

    @Resource
    private SysUserService sysUserService;

    @Resource
    private RolesService rolesService;
    @Autowired
    private TaskMapper taskMapper;


    /**
     * 参与的项目
     *
     * @return 所有数据
     */
    @Override
    public List<Project> queryParticipatedProjects(String projectName, String status) {
        Long userId = StpUtil.getLoginIdAsLong();
        // 判断是否是超级管理员
        boolean isSuperAdmin = StpUtil.hasRole(userId, ProjectConstants.SUPER_ADMIN_ROLE_KEY);
        if (isSuperAdmin) {
            return projectMapper.queryParticipatedProjects(null, projectName, status);
        }else {
            return projectMapper.queryParticipatedProjects(userId, projectName, status);
        }
    }

    @Transactional
    @Override
    public void addProject(Project project) {
//        String loginIdAsString = StpUtil.getLoginIdAsString();
//        Long parentId = project.getParentId();
//        if (parentId > 0) {
//            Project parentProject = projectMapper.selectOne(new LambdaQueryWrapper<Project>().eq(Project::getId, parentId));
//            Long owner = parentProject.getOwner();
//            SysUser parentSysUser = sysUserService.getOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getId, owner));
//            String userName = parentSysUser.getUserName();
//            if (!loginIdAsString.equals(parentSysUser.getId().toString())) {
//                throw new BusinessException("创建子项目需要发起项目oa流程,获取" + userName + "同意");
//            }
//        }

        //创建项目
        long userId = StpUtil.getLoginIdAsLong();
        project.setOwner(userId);
        projectMapper.insert(project);

        //创建admin角色
        Roles role = new Roles();
        role.setRoleKey(ProjectConstants.PROJECT_ADMIN_ROLE_KEY);
        role.setRoleName(project.getProjectName() + "_" + ProjectConstants.PROJECT_ADMIN_ROLE_NAME);
        rolesService.save(role);

        //创建user角色
        Roles userRole = new Roles();
        userRole.setRoleKey(ProjectConstants.PROJECT_USER_ROLE_KEY);
        userRole.setRoleName(project.getProjectName() + "_" + ProjectConstants.PROJECT_USER_ROLE_NAME);
        rolesService.save(userRole);

        //保存项目角色
        projectRoleService.saveProjectRole(project.getId(), role.getRoleId());
        projectRoleService.saveProjectRole(project.getId(), userRole.getRoleId());
        RoleUser roleUser = new RoleUser();
        roleUser.setRoleId(role.getRoleId());
        roleUser.setUserId(userId);
        roleUserService.save(roleUser);
    }

    @Override
    public void updateProject(ProjectDTO projectBody) {
        Project project = new Project();
        BeanUtil.copyProperties(projectBody, project);
        projectMapper.updateById(project);
    }

    @Override
    public List<ProjectMemberVO> queryProjectUsers(Long projectId) {
        return projectMapper.queryProjectUsers(projectId);
    }

    @Override
    public List<ProjectMemberVO> queryProjectUsersByName(Long projectId, String userName) {
        return projectMapper.queryProjectUsersByName(projectId, userName);

    }

    @Override
    public void inviteUser(Long id, String userNameOrEmail, Long roleId) {

        //通过用户名或者邮箱查询用户 获取用户id
        SysUser user = sysUserService.selectUserInfoByNameOrEmail(userNameOrEmail);
        if (ObjectUtils.isNull(user)) {
            throw new BusinessException("用户不存在");
        }
        //查看是否是项目成员
        List<ProjectMemberVO> projectUsers = projectMapper.queryProjectUsers(id);
        for (ProjectMemberVO projectUser : projectUsers) {
            if (projectUser.getUserId().equals(user.getId())) {
                throw new BusinessException("用户已经是项目成员");
            }
        }
        RoleUser roleUser = new RoleUser();
        roleUser.setRoleId(roleId);
        roleUser.setUserId(user.getId());
        roleUserService.save(roleUser);
    }

    @Override
    public void removeProjectUser(Long projectId, Long userId) {
        LambdaQueryWrapper<ProjectRole> queryWrapper = new LambdaQueryWrapper<ProjectRole>().eq(ProjectRole::getProjectId, projectId);
        List<ProjectRole> projectRoles = projectRoleService.list(queryWrapper);
        // 提取角色ID列表
        List<Long> roleIds = projectRoles.stream()
                .map(ProjectRole::getRoleId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        roleUserService.removeProjectUser(roleIds, userId);
    }

    @Override
    @Transactional
    public void agreeCreateSubProject(AgreeCreateSubProjectDTO agreeCreateSubProjectDTO) {

        String owner = agreeCreateSubProjectDTO.getOwner();
        String projectName = agreeCreateSubProjectDTO.getProjectName();
        if (agreeCreateSubProjectDTO.getProjectSubId() != null) {
            Project project = projectMapper.selectOne(new LambdaQueryWrapper<Project>().eq(Project::getId, agreeCreateSubProjectDTO.getProjectSubId()));
            if (project == null) {
                throw new BusinessException("项目不存在");
            }
            project.setParentId(agreeCreateSubProjectDTO.getProjectParentId());
            project.setStatus("1");
            projectMapper.updateById(project);
        } else {
            Project project = new Project();
            project.setProjectName(projectName);
            project.setDescription(agreeCreateSubProjectDTO.getProjectDescription());
            project.setParentId(agreeCreateSubProjectDTO.getProjectParentId());
            project.setOwner(Long.valueOf(owner));
            project.setCreateBy(Long.valueOf(owner));
            project.setStatus("1");
            projectMapper.insert(project);

            //创建admin角色
            Roles role = new Roles();
            role.setRoleKey(ProjectConstants.PROJECT_ADMIN_ROLE_KEY);
            role.setRoleName(projectName + "_" + ProjectConstants.PROJECT_ADMIN_ROLE_NAME);
            rolesService.save(role);

            //创建user角色
            Roles userRole = new Roles();
            userRole.setRoleKey(ProjectConstants.PROJECT_USER_ROLE_KEY);
            userRole.setRoleName(projectName + "_" + ProjectConstants.PROJECT_USER_ROLE_NAME);
            rolesService.save(userRole);

            //保存 admin user 项目角色
            projectRoleService.saveProjectRole(project.getId(), role.getRoleId());
            projectRoleService.saveProjectRole(project.getId(), userRole.getRoleId());
            RoleUser roleUser = new RoleUser();
            roleUser.setRoleId(role.getRoleId());
            roleUser.setUserId(Long.valueOf(owner));
            roleUserService.save(roleUser);
        }
        Task task = taskMapper.selectOne(new LambdaQueryWrapper<Task>().eq(Task::getId, agreeCreateSubProjectDTO.getTaskId()));
        if (task != null){
            task.setStatus(String.valueOf(ApprovalStatus.APPROVED.getCode()));
            taskMapper.updateById(task);
        }


    }

    public List<Long> getAllProjectIds(Long projectId){
        return projectMapper.getAllProjectIds(projectId);
    }

    @Override
    public Long getProjectCountByUserId(String loginIdAsString) {

      return   projectMapper.getProjectCountByUserId( loginIdAsString);
    }

    @Override
    public List<ProjectVO> queryProjectTree() {
        String loginIdAsString = StpUtil.getLoginIdAsString();
        // ==================== 2. 判断是否为superadmin ====================
        boolean isSuperAdmin = StpUtil.hasRole(loginIdAsString, ProjectConstants.SUPER_ADMIN_ROLE_KEY);
        if (isSuperAdmin){
            loginIdAsString = null;
        }
        List<ProjectVO>  projects = projectMapper.queryProjectTree(loginIdAsString);
        return  TreeBuilder.buildTree(projects, ProjectVO::getId, ProjectVO::getParentId);
    }
}




