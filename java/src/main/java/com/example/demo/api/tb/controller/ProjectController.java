package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;


import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.domain.Project;
import com.example.demo.api.tb.domain.dto.AgreeCreateSubProjectDTO;
import com.example.demo.api.tb.domain.dto.ProjectDTO;
import com.example.demo.api.tb.domain.vo.ProjectMemberVO;
import com.example.demo.api.tb.domain.vo.ProjectVO;
import com.example.demo.api.tb.service.ProjectService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * (Project)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:16:46
 */
@Slf4j
@RestController
@Validated
@RequestMapping("project")
public class ProjectController {
    /**
     * 服务对象
     */
    @Resource
    private ProjectService projectService;


    /**
     * 新建项目
     */
    @PostMapping("addProject")
    @NotForSuperAdmin
    public SaResult addProject(@RequestBody Project project) {
        projectService.addProject(project);
        return SaResult.ok();
    }

    /**
     * 同意创建、挂接子项目
     */
    @PostMapping("agreeCreateSubProject")
    @NotForSuperAdmin
    public SaResult agreeCreateSubProject(@RequestBody @Valid AgreeCreateSubProjectDTO agreeCreateSubProjectDTO) {
        projectService.agreeCreateSubProject(agreeCreateSubProjectDTO);
        return SaResult.ok( "子项目创建成功");
    }



    /**
     * 参与的项目
     *
     * @return 所有数据
     */

    @PostMapping("queryParticipatedProjects")
    public SaResult queryParticipatedProjects(@RequestParam( required = false) String status,
                                              @RequestParam( required = false) String projectName
    ) {
        Optional.ofNullable(status).orElseThrow( () -> new RuntimeException("项目状态不能为空"));
//        Optional.ofNullable(status).orElseGet( () -> "待处理");
        List<Project> projects = projectService.queryParticipatedProjects(projectName, status);
        return SaResult.ok().setData(projects);
    }


    /**
     * 根据项目id查询项目信息
     *
     * @return 所有数据
     */
    @GetMapping("queryProjectById/{id}")
    public SaResult queryProjectById(@PathVariable Long id) {
        Project project = projectService.getById(id);
        return SaResult.ok().setData(project);
    }


    /**
     * 修改项目数据
     *
     * @param projectBody 实体对象
     * @return 修改结果
     */

    @PostMapping("updateProject")
    @NotForSuperAdmin
    public SaResult updateProject(@RequestBody ProjectDTO projectBody) {
        projectService.updateProject(projectBody);
        return SaResult.ok();
    }

    /**
     * 删除项目数据
     */
    @GetMapping("deleteProject/{id}")
    @NotForSuperAdmin
    public SaResult deleteProject(@PathVariable Long id) {
        projectService.removeById(id);
        return SaResult.ok();
    }


    /**
     * 查看项目成员
     */
    @GetMapping("queryProjectUsers/{id}")
    public SaResult queryProjectUsers(@PathVariable Long id) {
        List<ProjectMemberVO> list = projectService.queryProjectUsers(id);
        return SaResult.ok().setData(list);
    }

    /**
     * 通过名称查询项目下的用户
     */

    @PostMapping("queryProjectUsersByName")
    public SaResult queryProjectUsersByName(@RequestParam Long id,
                                            @RequestParam( required = false) String userName) {
        try {
            if (id == null || id <= 0) {
                return SaResult.error("项目ID不能为空且必须大于0");
            }
            List<ProjectMemberVO> list = projectService.queryProjectUsersByName(id, userName);
            return SaResult.ok().setData(list);
        } catch (Exception e) {
            // 记录异常日志
            log.error("查询项目用户列表失败，项目ID：{}，用户名：{}", id, userName, e);
            return SaResult.error("查询项目用户列表失败");
        }
    }


    /**
     * 通过邮箱或者用户名称邀请用户加入项目
     */
    @PostMapping("inviteUser")
    @NotForSuperAdmin
    public SaResult inviteUser(@RequestParam Long id,
                               @RequestParam String userNameOrEmail,
                               @RequestParam Long roleId) {
        projectService.inviteUser(id, userNameOrEmail,roleId);
        return SaResult.ok();
    }

    /**
     * 移除项目成员
     */
    @PostMapping("removeProjectUser")
    @NotForSuperAdmin
    public SaResult removeProjectUser(@RequestParam Long projectId,
                                     @RequestParam Long userId) {
        projectService.removeProjectUser(projectId, userId);
        return SaResult.ok();
    }


    /**
     * 项目树形结构
     *
     * @return 所有数据
     */
    @GetMapping("queryProjectTree")
    public SaResult queryProjectTree() {
       List<ProjectVO> projectTree =  projectService.queryProjectTree();
        return SaResult.ok().setData(projectTree).setMsg("获取项目树形结构成功");
    }


}

