package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.Project;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.RoleUser;
import com.example.demo.api.tb.domain.vo.ProjectMemberVO;
import com.example.demo.api.tb.domain.vo.ProjectVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
* @author ji156
* @description 针对表【project】的数据库操作Mapper
* @createDate 2025-02-10 17:00:28
* @Entity com.example.demo.api.tb.domain.Project
*/
@Mapper
public interface ProjectMapper extends BaseMapper<Project> {

    /**
     * 参与的项目
     * @return 所有数据
     */
    

    List<Project> queryVisibleProjects();

    List<Project> queryParticipatedProjects(@Param("userId") Long userId,@Param("projectName") String projectName,@Param("status") String status);

    List<ProjectMemberVO> queryProjectUsers(Long projectId);

    List<ProjectMemberVO> queryProjectUsersByName(@Param("projectId") Long projectId,@Param("userName") String userName);

    List<Long> getAllProjectIds(@Param("projectId") Long projectId);

    Long getProjectCountByUserId(String loginIdAsString);
    //项目树
    List<ProjectVO> queryProjectTree(@Param("loginIdAsString") String loginIdAsString);
}




