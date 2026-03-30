package com.example.demo.api.tb.controller;



import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.domain.RoleMenu;
import com.example.demo.api.tb.result.Result;
import  com.example.demo.api.tb.service.RoleMenuService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.Serializable;
import java.util.List;

/**
 * 角色和菜单关联表(RoleMenu)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:17:07
 */
@RestController
@RequestMapping("roleMenu")
public class RoleMenuController  {












    /**
     * 服务对象
     */
    @Resource
    private RoleMenuService roleMenuService;

    /**
     * 分页查询所有数据
     *
     * @param page 分页对象
     * @param roleMenu 查询实体
     * @return 所有数据
     */
    @GetMapping
    public Result selectAll(Page<RoleMenu> page, RoleMenu roleMenu) {
        return Result.ok(this.roleMenuService.page(page, new QueryWrapper<>(roleMenu)));
    }

    /**
     * 通过主键查询单条数据
     *
     * @param id 主键
     * @return 单条数据
     */
    @GetMapping("{id}")
    public Result selectOne(@PathVariable Serializable id) {
        return Result.ok(this.roleMenuService.getById(id));
    }

    /**
     * 新增数据
     *
     * @param roleMenu 实体对象
     * @return 新增结果
     */
    @PostMapping
    public Result insert(@RequestBody RoleMenu roleMenu) {
        return Result.ok(this.roleMenuService.save(roleMenu));
    }

    /**
     * 修改数据
     *
     * @param roleMenu 实体对象
     * @return 修改结果
     */
    @PutMapping
    public Result update(@RequestBody RoleMenu roleMenu) {
        return Result.ok(this.roleMenuService.updateById(roleMenu));
    }

    /**
     * 删除数据
     *
     * @param idList 主键结合
     * @return 删除结果
     */
    @DeleteMapping
    public Result delete(@RequestParam("idList") List<Long> idList) {
        return Result.ok(this.roleMenuService.removeByIds(idList));
    }
}

