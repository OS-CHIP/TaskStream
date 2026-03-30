package com.example.demo.api.tb.controller;



import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.domain.Dynamic;

import com.example.demo.api.tb.result.Result;
import com.example.demo.api.tb.service.DynamicService;
import javax.annotation.Resource;
import org.springframework.web.bind.annotation.*;

import java.io.Serializable;
import java.util.List;

/**
 * (Dynamic)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:16:05
 */
@RestController
@RequestMapping("dynamic")
public class DynamicController {
    /**
     * 服务对象
     */
    @Resource
    private DynamicService dynamicService;

    /**
     * 分页查询所有数据
     *
     * @param page 分页对象
     * @param dynamic 查询实体
     * @return 所有数据
     */
    @GetMapping
    public Result selectAll(Page<Dynamic> page, Dynamic dynamic) {
        return Result.ok(this.dynamicService.page(page, new QueryWrapper<>(dynamic)));
    }

    /**
     * 通过主键查询单条数据
     *
     * @param id 主键
     * @return 单条数据
     */
    @GetMapping("{id}")
    public Result selectOne(@PathVariable Serializable id) {
        return Result.ok(this.dynamicService.getById(id));
    }

    /**
     * 新增数据
     *
     * @param dynamic 实体对象
     * @return 新增结果
     */
    @NotForSuperAdmin
    @PostMapping
    public Result insert(@RequestBody Dynamic dynamic) {
        return Result.ok(this.dynamicService.save(dynamic));
    }

    /**
     * 修改数据
     *
     * @param dynamic 实体对象
     * @return 修改结果
     */

    @NotForSuperAdmin
    @PutMapping
    public Result update(@RequestBody Dynamic dynamic) {
        return Result.ok(this.dynamicService.updateById(dynamic));
    }

    /**
     * 删除数据
     *
     * @param idList 主键结合
     * @return 删除结果
     */
    @NotForSuperAdmin
    @DeleteMapping
    public Result delete(@RequestParam("idList") List<Long> idList) {
        return Result.ok(this.dynamicService.removeByIds(idList));
    }
}

