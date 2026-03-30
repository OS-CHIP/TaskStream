package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.domain.TaskType;
import com.example.demo.api.tb.domain.dto.MemberInfoDTO;
import com.example.demo.api.tb.domain.dto.TaskOverviewDTO;
import com.example.demo.api.tb.service.ProjectService;
import com.example.demo.api.tb.service.TaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * (Comment)表控制层
 *
 * @author lvming
 * @since 2025-02-10 16:15:15
 */

@Slf4j
@RestController
@RequestMapping("projectOverview")
public class ProjectOverviewController {

    @Resource
    private TaskService taskService;
    @Resource
    private ProjectService projectService;


    /**
     * 发布评论
     *
     * @param id 获取项目的概览
     * @return 返回任务数，任务优先级分别
     */
    @GetMapping("/overview/{projectId}")
    public SaResult publishComment(@PathVariable Long projectId) {
        List<Long> projectIds = projectService.getAllProjectIds(projectId);
        TaskOverviewDTO taskOverview = taskService.getOverViewByProjectIds(projectIds);
        return SaResult.ok().setData(taskOverview);
    }
    @GetMapping("/getMemberInfos/{projectId}")
    public SaResult getMemberInfosByProjectId(@PathVariable Long projectId) {
        List<Long> projectIds = projectService.getAllProjectIds(projectId);
        List<MemberInfoDTO> memberInfos = taskService.getMemberInfosByProjectIds(projectIds);
        return SaResult.ok().setData(memberInfos);
    }

}



