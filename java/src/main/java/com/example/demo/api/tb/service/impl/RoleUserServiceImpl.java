package com.example.demo.api.tb.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.ProjectRole;
import com.example.demo.api.tb.domain.RoleUser;

import com.example.demo.api.tb.mapper.RoleUserMapper;
import com.example.demo.api.tb.service.RoleUserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
* @author ji156
* @description 针对表【user_role】的数据库操作Service实现
* @createDate 2025-02-17 16:01:13
*/
@Slf4j
@Service
public class RoleUserServiceImpl extends ServiceImpl<RoleUserMapper, RoleUser> implements RoleUserService {

    @Resource
    private RoleUserMapper roleUserMapper;


    /**
     * 批量删除项目用户
     * @param
     * @param userId
     */
    @Override
    public void removeProjectUser(List<Long> roleIds, Long userId) {
        // 参数校验
        if (userId == null) {
            log.warn("用户ID不能为空");
            return;
        }
        if (roleIds == null || roleIds.isEmpty()) {
            log.warn("角色ID列表不能为空");
            return;
        }
        try {
            // 构造删除条件
            LambdaQueryWrapper<RoleUser> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.eq(RoleUser::getUserId, userId)
                    .in(RoleUser::getRoleId, roleIds);
            // 执行批量删除
            int deletedCount = roleUserMapper.delete(queryWrapper);

            // 根据删除结果记录不同级别的日志
            if (deletedCount > 0) {
                log.info("成功删除用户角色关系，用户ID：{}，删除条数：{}", userId, deletedCount);
            } else {
                log.info("未找到匹配的用户角色关系进行删除，用户ID：{}，角色ID列表：{}", userId, roleIds);
            }
        } catch (Exception e) {
            log.error("删除用户角色关系失败，用户ID：{}，角色ID列表：{}", userId, roleIds, e);
            throw e;
        }
    }
}





