package com.example.demo.api.tb.controller;



import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.domain.Shortcut;
import com.example.demo.api.tb.result.Result;
import  com.example.demo.api.tb.service.ShortcutService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.Serializable;
import java.util.List;

/**
 *  创建捷径表(Shortcut)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:17:28
 */
@RestController
@RequestMapping("shortcut")
public class ShortcutController {
    /**
     * 服务对象
     */
    @Resource
    private ShortcutService shortcutService;

    /**
     * 分页查询所有数据
     *
     * @param page 分页对象
     * @param shortcut 查询实体
     * @return 所有数据
     */
    @GetMapping
    public Result selectAll(Page<Shortcut> page, Shortcut shortcut) {
        return Result.ok(this.shortcutService.page(page, new QueryWrapper<>(shortcut)));
    }

    /**
     * 通过主键查询单条数据
     *
     * @param id 主键
     * @return 单条数据
     */
    @GetMapping("{id}")
    public Result selectOne(@PathVariable Serializable id) {
        return Result.ok(this.shortcutService.getById(id));
    }

    /**
     * 新增数据
     *
     * @param shortcut 实体对象
     * @return 新增结果
     */
    @PostMapping
    public Result insert(@RequestBody Shortcut shortcut) {
        return Result.ok(this.shortcutService.save(shortcut));
    }

    /**
     * 修改数据
     *
     * @param shortcut 实体对象
     * @return 修改结果
     */
    @PutMapping
    public Result update(@RequestBody Shortcut shortcut) {
        return Result.ok(this.shortcutService.updateById(shortcut));
    }

    /**
     * 删除数据
     *
     * @param idList 主键结合
     * @return 删除结果
     */
    @DeleteMapping
    public Result delete(@RequestParam("idList") List<Long> idList) {
        return Result.ok(this.shortcutService.removeByIds(idList));
    }
}

