package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.domain.Component;
import com.example.demo.api.tb.result.Result;
import com.example.demo.api.tb.service.ComponentService;
import javax.annotation.Resource;

import org.springframework.web.bind.annotation.*;

import java.util.List;


/**
 * (Component)前端组件表 控制层
 *
 * @author makejava
 * @since 2025-02-10 16:15:36
 */
@RestController
@RequestMapping("component")
public class ComponentController  {
    /**
     * 服务对象
     */
    @Resource
    private ComponentService componentService;


    /**
     * 查询前端组件表列表
     * @return 前端组件表列表
     */
    @GetMapping("selectAll")
    public SaResult selectAll() {
        List<Component> list = componentService.list();
        return SaResult.ok().setData(list);
    }
}

