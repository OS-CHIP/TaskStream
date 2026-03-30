package com.example.demo.api.tb.controller;



import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.domain.SysDept;
import com.example.demo.api.tb.result.Result;
import  com.example.demo.api.tb.service.SysDeptService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.Serializable;
import java.util.List;

/**
 * 部门表(SysDept)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:17:37
 */
@RestController
@RequestMapping("sysDept")
public class SysDeptController  {
    /**
     * 服务对象
     */
    @Resource
    private SysDeptService sysDeptService;

    /**
     * 分页查询所有数据
     *
     * @param page 分页对象
     * @param sysDept 查询实体
     * @return 所有数据
     */
    @GetMapping
    public Result selectAll(Page<SysDept> page, SysDept sysDept) {
        return Result.ok(this.sysDeptService.page(page, new QueryWrapper<>(sysDept)));
    }

    /**
     * 通过主键查询单条数据
     *
     * @param id 主键
     * @return 单条数据
     */
    @GetMapping("{id}")
    public Result selectOne(@PathVariable Serializable id) {
        return Result.ok(this.sysDeptService.getById(id));
    }

    /**
     * 新增数据
     *
     * @param sysDept 实体对象
     * @return 新增结果
     */
    @PostMapping
    public Result insert(@RequestBody SysDept sysDept) {
        return Result.ok(this.sysDeptService.save(sysDept));
    }

    /**
     * 修改数据
     *
     * @param sysDept 实体对象
     * @return 修改结果
     */
    @PutMapping
    public Result update(@RequestBody SysDept sysDept) {
        return Result.ok(this.sysDeptService.updateById(sysDept));
    }

    /**
     * 删除数据
     *
     * @param idList 主键结合
     * @return 删除结果
     */
    @DeleteMapping
    public Result delete(@RequestParam("idList") List<Long> idList) {
        return Result.ok(this.sysDeptService.removeByIds(idList));
    }
}

