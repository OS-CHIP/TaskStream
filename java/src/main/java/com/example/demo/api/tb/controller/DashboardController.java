package com.example.demo.api.tb.controller;

import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.domain.vo.Dashboard.DashboardData;
import com.example.demo.api.tb.service.TaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import javax.annotation.Resource;
/**
 * @author jizitao
 * @since 2025-02-10 16:15:15
 */

@Slf4j
@RestController
@RequestMapping("dashboard")
@Validated
public class DashboardController {



    @Resource
    private TaskService taskService;

    /**
     * 首页
     */
    @PostMapping("/getDashboard")
    public SaResult getDashboard(@RequestParam(required = false) Long projectId,
                                 @RequestParam(required = false) String startTime,
                                 @RequestParam(required = false) String dueTime){

        DashboardData dashboard = taskService.getDashboard(projectId, startTime, dueTime);
        return  SaResult.ok("查询首页信息").setData(dashboard);
    }



}



