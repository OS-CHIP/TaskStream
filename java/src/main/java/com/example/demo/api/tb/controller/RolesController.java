package com.example.demo.api.tb.controller;


import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.constant.ProjectConstants;
import com.example.demo.api.tb.domain.Roles;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import com.example.demo.api.tb.domain.vo.RolesVO;
import com.example.demo.api.tb.result.Result;
import com.example.demo.api.tb.service.RolesService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.Serializable;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 角色信息表(Roles)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:17:18
 */
@RestController
@RequestMapping("roles")
public class RolesController {


    /**
     * 服务对象
     */
    @Resource
    private RolesService rolesService;

    /**
     * 通过项目id查询角色信息
     */
    @RequestMapping("queryProjectRoles")
    public SaResult queryProjectRoles(@RequestParam Long projectId) {
        // 参数校验
        if (projectId == null) {
            return SaResult.error("项目ID不能为空");
        }

        try {
            List<Roles> rolesList = rolesService.queryProjectRoles(projectId);
            List<RolesVO> rolesVoList = rolesList.stream()
                    .map(roles -> {
                        RolesVO vo = new RolesVO();
                        vo.setRoleId(roles.getRoleId());
                        vo.setRoleName(roles.getRoleName());
                        return vo;
                    })
                    .collect(Collectors.toList());
            return SaResult.ok().setData(rolesVoList);
        } catch (Exception e) {
            // 异常处理
            return SaResult.error("查询项目角色信息失败：" + e.getMessage());
        }
    }




    /**
     * 添加角色信息(Roles)表
     */
    @PostMapping("saveRoles")
    @NotForSuperAdmin
    public Result saveRoles(@RequestBody RolesDTO rolesDto) {
        rolesService.saveRoles(rolesDto);
        return Result.ok();
    }

    /**
     * 根据userId,projectId查询角色信息
     */
    @PostMapping("queryRoleByuserIdAndprojectId")
    public Result queryRoleByuserIdAndprojectId(@RequestBody RolesDTO rolesDto) {
        return Result.ok(rolesService.queryRoleByuserIdAndprojectId(rolesDto));
    }


    /**
     * 分页查询所有数据
     *
     * @param page  分页对象
     * @param roles 查询实体
     * @return 所有数据
     */
    @GetMapping
    public Result selectAll(Page<Roles> page, Roles roles) {
        return Result.ok(this.rolesService.page(page, new QueryWrapper<>(roles)));
    }

    /**
     * 通过主键查询单条数据
     *
     * @param id 主键
     * @return 单条数据
     */
    @GetMapping("{id}")
    public Result selectOne(@PathVariable Serializable id) {
        return Result.ok(this.rolesService.getById(id));
    }

    /**
     * 新增数据
     *
     * @param roles 实体对象
     * @return 新增结果
     */
    @PostMapping
    @NotForSuperAdmin
    public Result insert(@RequestBody Roles roles) {
        return Result.ok(this.rolesService.save(roles));
    }

    /**
     * 修改数据
     *
     * @param roles 实体对象
     * @return 修改结果
     */
    @PutMapping
    @NotForSuperAdmin
    public Result update(@RequestBody Roles roles) {
        return Result.ok(this.rolesService.updateById(roles));
    }

    /**
     * 删除数据
     *
     * @param idList 主键结合
     * @return 删除结果
     */
    @DeleteMapping
    @NotForSuperAdmin
    public Result delete(@RequestParam("idList") List<Long> idList) {
        return Result.ok(this.rolesService.removeByIds(idList));
    }
}

