package com.example.demo.api.tb.controller;


import cn.dev33.satoken.SaManager;
import cn.dev33.satoken.stp.SaLoginModel;
import cn.dev33.satoken.stp.StpLogic;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.stp.parameter.SaLoginParameter;
import cn.dev33.satoken.util.SaResult;
import cn.hutool.crypto.digest.BCrypt;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.demo.api.tb.domain.SysUser;
import com.example.demo.api.tb.domain.dto.RolesDTO;
import com.example.demo.api.tb.domain.dto.PasswordLoginDTO;
import com.example.demo.api.tb.domain.dto.RegisterDTO;
import com.example.demo.api.tb.domain.dto.SysUserPasswordDTO;
import com.example.demo.api.tb.domain.vo.SysUserVO;
import com.example.demo.api.tb.domain.vo.UserInfoVO;
import com.example.demo.api.tb.result.Result;
import com.example.demo.api.tb.service.SysUserService;


import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;

import java.util.List;

/**
 * 用户信息表(Users)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:18:24
 */
@RestController
@RequestMapping("users")
public class SysUserController {
    /**
     * 服务对象
     */
    @Resource
    private SysUserService usersService;

    @RequestMapping("doLogin")
    public SaResult doLogin(@RequestBody PasswordLoginDTO passwordLoginBody) {
        String password = passwordLoginBody.getPassword();
        SysUser user = usersService.getOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUserName, passwordLoginBody.getUsername()));
        if (user != null) {
            if (!BCrypt.checkpw(password, user.getPassword())) {
                return SaResult.error( "密码错误");
            }
//            StpLogic userStp = SaManager.getStpLogic("user");
//            userStp.login(user.getId(), new SaLoginParameter().setExtra("username", user.getUserName()));
            StpUtil.login(user.getId(), new SaLoginParameter().setExtra("username", user.getUserName()));

            return SaResult.ok("登录成功");
        }
        return SaResult.error("登录失败");


//            StpUtil.login(one.getId(), new SaLoginModel()
////                    .setDevice(type)                // 此次登录的客户端设备类型, 用于[同端互斥登录]时指定此次登录的设备类型
//                    .setIsLastingCookie(true)        // 是否为持久Cookie（临时Cookie在浏览器关闭时会自动删除，持久Cookie在重新打开后依然存在）
//                    .setTimeout(60 * 60 * 24 * 7)    // 指定此次登录token的有效期, 单位:秒 （如未指定，自动取全局配置的 timeout 值）
////                .setToken("xxxx-xxxx-xxxx-xxxx") // 预定此次登录的生成的Token
////                    .setIsWriteHeader(false)
//                    .setExtra("name", one.getUserName()));      // 是否在登录后将 Token 写入到响应头

//// SaLoginParameter 配置登录相关参数
//            StpUtil.login(one.getId(), new SaLoginParameter()
//                    .setDeviceType("PC")             // 此次登录的客户端设备类型, 一般用于完成 [同端互斥登录] 功能
//                    .setDeviceId("xxxxxxxxx")        // 此次登录的客户端设备ID, 登录成功后该设备将标记为可信任设备
//                    .setIsLastingCookie(true)        // 是否为持久Cookie（临时Cookie在浏览器关闭时会自动删除，持久Cookie在重新打开后依然存在）
//                    .setTimeout(60 * 60 * 24 * 7)    // 指定此次登录 token 的有效期, 单位:秒，-1=永久有效
//                    .setActiveTimeout(60 * 60 * 24 * 7) // 指定此次登录 token 的最低活跃频率, 单位:秒，-1=不进行活跃检查
//                    .setIsConcurrent(true)           // 是否允许同一账号多地同时登录 （为 true 时允许一起登录, 为 false 时新登录挤掉旧登录）
//                    .setIsShare(false)                // 在多人登录同一账号时，是否共用一个 token （为 true 时所有登录共用一个token, 为 false 时每次登录新建一个 token）
//                    .setMaxLoginCount(12)            // 同一账号最大登录数量，-1代表不限 （只有在 isConcurrent=true, isShare=false 时此配置项才有意义）
//                    .setMaxTryTimes(12)              // 在每次创建 token 时的最高循环次数，用于保证 token 唯一性（-1=不循环尝试，直接使用）
//                    .setExtra("key", "value")        // 记录在 Token 上的扩展参数（只在 jwt 模式下生效）
////                    .setToken("xxxx-xxxx-xxxx-xxxx") // 预定此次登录的生成的Token
//                    .setIsWriteHeader(false)         // 是否在登录后将 Token 写入到响应头
//                    .setTerminalExtra("key", "value")// 本次登录挂载到 SaTerminalInfo 的自定义扩展数据
//            );
//

        // 获取当前会话的 token 信息参数
//            System.out.println(StpUtil.getTokenInfo());
//            System.out.println(StpUtil.getExtra("name"));
//            SaTokenInfo tokenInfo = StpUtil.getTokenInfo();
//            String tokenValue = StpUtil.getTokenValue();
    }

    /**
     * 用户注册
     */
    @PostMapping("register")
    public SaResult register( @RequestBody @Valid RegisterDTO registerBody) {
        usersService.register(registerBody);
        return SaResult.ok("注册成功");
    }
    // 注销登录，浏览器访问： URL_ADDRESS    // 注销登录，浏览器访问： http://localhost:8081/user/logout
    @RequestMapping("logout")
    public String logout() {
        Object loginId = StpUtil.getLoginId();
        StpUtil.logout(loginId);
        return "当前会话是否登录：" + StpUtil.isLogin();
    }


    /**
     * 获取用户信息
     *
     * @return 用户信息
     */
    @GetMapping("getInfo")
    public SaResult getInfo() {
        UserInfoVO userInfoVo = new UserInfoVO();
        Long loginIdAsLong = StpUtil.getLoginIdAsLong();

        SysUserVO sysUserVo = usersService.selectUserById(loginIdAsLong);
        //todo 权限相关
        //todo 角色相关
        userInfoVo.setUser(sysUserVo);
        return SaResult.ok().setData(userInfoVo);
    }


    /**
     * 重置密码
     *
     * @param sysUserPasswordBody 新旧密码
     */

    @PostMapping("/updatePwd")
    public SaResult updatePwd(@Validated @RequestBody SysUserPasswordDTO sysUserPasswordBody) {
        Long loginIdAsLong = StpUtil.getLoginIdAsLong();
        SysUserVO user = usersService.selectUserById(loginIdAsLong);
        String password = user.getPassword();
        if (!BCrypt.checkpw(sysUserPasswordBody.getOldPassword(), password)) {
            return SaResult.error("修改密码失败，旧密码错误");
        }
        if (BCrypt.checkpw(sysUserPasswordBody.getNewPassword(), password)) {
            return SaResult.error("新密码不能与旧密码相同");
        }
        int rows = usersService.resetUserPwd(loginIdAsLong, BCrypt.hashpw(sysUserPasswordBody.getNewPassword()));
        if (rows > 0) {
            return SaResult.ok();
        }
        return SaResult.error("修改密码异常，请联系管理员");
    }


    @RequestMapping("isLogin")
    public SaResult isLogin() {
        return SaResult.ok("是否登录：" + StpUtil.isLogin());
    }




//
//    @RequestMapping("isLogin")
//    public SaResult isLogin() {
//        return SaResult.ok("是否登录：" + StpUtil.isLogin());
//    }



    // 踢下线，浏览器访问： URL_ADDRESS    // 踢下线，浏览器访问： http://localhost:8081/user/kickout/{type}
    @RequestMapping("kickout/{type}")
    public String kickout(@PathVariable String type) {
        Object loginId = StpUtil.getLoginId();
        StpUtil.kickout(loginId, type);
        return "当前会话是否登录：" + StpUtil.isLogin();
    }

    /**
     * 查看角色下的成员
     */
//    @SaIgnore
    @PostMapping("queryUsersByRole")
    public Result queryUsersByRole(@RequestBody RolesDTO rolesDto) {
        System.out.println(StpUtil.getDisableTime(1, "comment"));
        List<SysUser> users = usersService.queryUsersByRole(rolesDto);
        return Result.ok(users);
    }

    /**
     * 封禁用户
     */
    @GetMapping("disable/{userId}/{time}")
    public Result disable(@PathVariable Long userId,
                          @PathVariable Long time) {
        // StpUtil.checkDisable(1, "comment");
        // 先踢下线
        StpUtil.kickout(userId);
        // 再封禁账号
        StpUtil.disable(userId, "comment", time);
        return Result.ok();
    }


}


