package  com.example.demo.api.tb.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Roles;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import com.example.demo.api.tb.mapper.RolesMapper;
import com.example.demo.api.tb.service.ProjectRoleService;
import  com.example.demo.api.tb.service.RolesService;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
* @author ji156
* @description 针对表【roles(角色信息表)】的数据库操作Service实现
* @createDate 2025-02-10 17:00:35
*/
@Service
public class RolesServiceImpl extends ServiceImpl<RolesMapper, Roles>
    implements RolesService{

    @Resource
    private RolesMapper rolesMapper;
    @Resource
    private ProjectRoleService projectRoleService;
    @Override
    public List<Roles> queryProjectRoles( Long projectId) {
        return rolesMapper.queryProjectRoles(projectId);
    }

    @Override
    public void saveRoles(RolesDTO rolesDto) {
        // 新增角色
        Roles roles = new Roles();
        BeanUtils.copyProperties(rolesDto,roles);
        rolesMapper.insert(roles);
        // 保存项目角色用户表
        projectRoleService.saveProjectRole(rolesDto.getProjectId(),roles.getRoleId());

    }
    /**
     * 根据userId,projectId查询角色信息
     * @param rolesDto
     */
    @Override
    public Roles queryRoleByuserIdAndprojectId(RolesDTO rolesDto) {
        Long projectId = rolesDto.getProjectId();
        long userId = StpUtil.getLoginIdAsLong();
        return rolesMapper.queryRoleByuserIdAndprojectId(userId,projectId);
    }



}




