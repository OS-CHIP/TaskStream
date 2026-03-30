package  com.example.demo.api.tb.service.impl;

import cn.hutool.core.util.ObjectUtil;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.SysUser;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import com.example.demo.api.tb.domain.dto.RegisterDTO;
import com.example.demo.api.tb.domain.vo.SysUserVO;
import com.example.demo.api.tb.mapper.UserMapper;
import com.example.demo.api.tb.service.SysUserService;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
* @author ji156
* @description 针对表【users(用户信息表)】的数据库操作Service实现
* @createDate 2025-02-10 17:01:25
*/
@Service
public class SysUserServiceImpl extends ServiceImpl<UserMapper, SysUser>
    implements SysUserService {

    @Resource
    private UserMapper usersMapper;
    @Override
    public List<SysUser> queryUsersByRole(RolesDTO rolesDto) {
        // 校验角色是否存在
        if (rolesDto.getRoleId() == null) {
            throw new IllegalArgumentException("角色不存在");
        }
        List<SysUser> users= usersMapper.queryUsersByRole(rolesDto);
        return users;
    }

    @Override
    public void register(RegisterDTO registerBody) {
        // 校验用户名是否存在 或者 校验邮箱是否存在  两个存在一个就报错
        String username = registerBody.getUsername();
        String email = registerBody.getEmail();
        if (checkUsernameExists(username)) {
            throw new IllegalArgumentException("用户名 " + username + " 已存在");
        }
        if (checkEmailExists(email)) {
            throw new IllegalArgumentException("邮箱 " + email + " 已存在");
        }

        SysUser users=new SysUser();
        users.setUserName(registerBody.getUsername());
        users.setPassword(BCrypt.hashpw(registerBody.getPassword()));
        users.setEmail(registerBody.getEmail());
        usersMapper.insert(users);
    }

    /**
     * 通过用户ID查询用户
     *
     * @param userId 用户ID
     * @return 用户对象信息
     */
    @Override
    public SysUserVO selectUserById(Long userId) {

        SysUserVO userInfoVo = new SysUserVO();
        SysUser user = baseMapper.selectById(userId);
        if (ObjectUtil.isNull(user)) {
            return userInfoVo;
        }
        BeanUtils.copyProperties(user, userInfoVo);
        return userInfoVo;
    }

    /**
     * 重置用户密码
     *
     * @param userId   用户ID
     * @param password 密码
     * @return 结果
     */
    @Override
    public int resetUserPwd(Long userId, String password) {
        return baseMapper.update(null,
                new LambdaUpdateWrapper<SysUser>()
                        .set(SysUser::getPassword, password)
                        .eq(SysUser::getId, userId));
    }

    @Override
    public SysUser selectUserInfoByNameOrEmail(String userNameOrEmail) {

        return baseMapper.selectOne(new LambdaQueryWrapper<SysUser>()
                .eq(SysUser::getUserName, userNameOrEmail)
                .or()
                .eq(SysUser::getEmail, userNameOrEmail));
    }


    /**
     * 校验用户名是否存在
     * @param username 要校验的用户名
     * @return 如果存在返回true，否则返回false
     */
    private boolean checkUsernameExists(String username) {
        LambdaQueryWrapper<SysUser> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysUser::getUserName, username);
        return baseMapper.selectOne(queryWrapper) != null;
    }

    /**
     * 校验邮箱是否存在
     * @param email 要校验的邮箱
     * @return 如果存在返回true，否则返回false
     */
    private boolean checkEmailExists(String email) {
        LambdaQueryWrapper<SysUser> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SysUser::getEmail, email);
        return baseMapper.selectOne(queryWrapper) != null;
    }

    public static void main(String[] args) {
        System.out.println(BCrypt.hashpw("wangwenxue"));
    }
}




