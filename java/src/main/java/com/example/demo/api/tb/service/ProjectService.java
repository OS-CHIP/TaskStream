package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.Project;
import com.example.demo.api.tb.domain.dto.AgreeCreateSubProjectDTO;
import com.example.demo.api.tb.domain.dto.CreateSubProjectOaDTO;
import com.example.demo.api.tb.domain.dto.ProjectDTO;
import com.example.demo.api.tb.domain.vo.ProjectMemberVO;
import com.example.demo.api.tb.domain.vo.ProjectVO;
import org.apache.ibatis.annotations.Param;

import javax.validation.Valid;
import java.util.List;

/**
* @author ji156
* @description 针对表【project】的数据库操作Service
* @createDate 2025-02-10 17:00:28
*/
public interface ProjectService extends IService<Project> {


    List<Project> queryParticipatedProjects(String projectName, String status);

    void addProject(Project project);

    void updateProject(ProjectDTO projectBody);

    List<ProjectMemberVO> queryProjectUsers(Long projectId);

    List<ProjectMemberVO> queryProjectUsersByName(Long projectId, String userName);

    void inviteUser(Long id, String userNameOrEmail, Long roleId);

    void removeProjectUser(Long projectId, Long userId);

    void agreeCreateSubProject(@Valid AgreeCreateSubProjectDTO agreeCreateSubProjectDTO);

    //获取 项目以及子id
    List<Long> getAllProjectIds(Long projectId);

    Long getProjectCountByUserId(String loginIdAsString);

    //项目树
    List<ProjectVO> queryProjectTree();
}

    
