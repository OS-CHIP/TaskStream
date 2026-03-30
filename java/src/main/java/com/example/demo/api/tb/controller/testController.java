package com.example.demo.api.tb.controller;


import cn.dev33.satoken.annotation.SaCheckSafe;
import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import cn.hutool.jwt.Claims;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;


/**
 * (WorkflowNodeTurnover)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:18:55
 */
@RestController
@RequestMapping("/test")
public class testController {

    @Resource
    RedisTemplate redisTemplate;
    // 删除仓库
    @SaCheckSafe("仓库删除失败，请完成二级认证后再次访问接口")
    @RequestMapping("deleteUser")
    public SaResult deleteUser() {
        // 第1步，先检查当前会话是否已完成二级认证
//        if(!StpUtil.isSafe()) {
//            return SaResult.error("仓库删除失败，请完成二级认证后再次访问接口");
//        }

        // 第2步，如果已完成二级认证，则开始执行业务逻辑
        // ...

        // 第3步，返回结果
        return SaResult.ok("仓库删除成功");
    }
    // 提供密码进行二级认证
    @RequestMapping("openSafe")
    public SaResult openSafe(String password) {
        // 比对密码（此处只是举例，真实项目时可拿其它参数进行校验）
        if("123456".equals(password)) {

            // 比对成功，为当前会话打开二级认证，有效期为120秒
            StpUtil.openSafe(120);
            return SaResult.ok("二级认证成功");
        }

        // 如果密码校验失败，则二级认证也会失败
        return SaResult.error("二级认证失败");
    }


    public static void main(String[] args) {
        // 示例 JWT
        // 假设有一个 Token
        String token = "your-token-here";

        // 解析 Token
        SaTokenInfo tokenInfo = StpUtil.getTokenInfo();

        // 输出解析结果
        System.out.println("Token: " + tokenInfo.getTokenValue());
        System.out.println("Login ID: " + tokenInfo.getLoginId());
        System.out.println("Token Name: " + tokenInfo.getTokenName());
        System.out.println("Token Active Timeout: " + tokenInfo.getTokenActiveTimeout());
        System.out.println("Token Session Timeout: " + tokenInfo.getTokenSessionTimeout());
    }
    @RequestMapping("test1")
    public SaResult test() {
        // 存储数据到哈希表，字段和值均为字符串
        redisTemplate.opsForHash()
                .put("1asdasd", "sdfsdf2", "3dfgdf");

        return SaResult.error("二级认证失败");
    }
}

