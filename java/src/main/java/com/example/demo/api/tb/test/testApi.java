package com.example.demo.api.tb.test;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.httpauth.basic.SaHttpBasicUtil;
import cn.dev33.satoken.jwt.SaJwtUtil;
import cn.dev33.satoken.jwt.StpLogicJwtForSimple;
import cn.dev33.satoken.secure.SaSecureUtil;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import cn.hutool.json.JSONObject;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("testApi")
public class testApi

{

    @SaIgnore // 忽略认证
    @RequestMapping("rsaGenerateKeyPair")
    public SaResult rsaGenerateKeyPair() throws Exception {

        // 生成一对公钥和私钥，其中Map对象 (private=私钥, public=公钥)
        HashMap<String, String> stringStringHashMap = SaSecureUtil.rsaGenerateKeyPair();

        return SaResult.ok().setData(stringStringHashMap);
    }

    @SaIgnore // 忽略认证
    @RequestMapping("text")
    public SaResult text() throws Exception {
        // 定义私钥和公钥
        String privateKey = "MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBALPJ1vdfH3hQjLgb/14yLeXAWqvadp3ZpVIzJVIbF6GqIfx1PVl7AxRTF5ssjPPxdyLm/daYPiAl5QOOBSYxaBeVU8Qqb3nN6anN1pe8rxoAG44CKKSJSJ2hTDDMZLqfKNlto/xhCiW2wyFEcWL56oD9YhUTO8xtWXiDaQEO++WdAgMBAAECgYANbVkTH3ULuMRRqbGgONIpsvxykj3CmzMYGP7EC4bvyXOBVcYvrRq1RWFhcunR/CogHq09fiBBqWLZqZ0j1ZPG8w+Ff9v5RxMK2AIzIYo97JRKXZzOx81Q5/AgMDpgF6rNBg2T+DYKEuxKSr+m1XInKMBJLVDyQVaTdN/GYYMe4QJBANvwFAen+tDaCIFDbPK0OrzGNXUMCi5CXgvGxTa7j0ORk7Bxi/yBpc+z0tnMKAnjfEqSjgzw6ob31GX2/RmB5c0CQQDRRHxcjM3i0GY4M0mOnzzyuOigZxbBAuqNH/HUV+YhuPjcQpLRy4MEQJdaGCMOT9h7FYNvuum7B9IDmGSZ1y8RAkEA14BSr/nJCdFJmhbN7rXoA8YW5Rwp8Y+4BMP7wxheVO+UjcOETaNfK7fgNuYSqTXMOGmHZGi+9AZriIlNECw2VQJAHgJKKyNt6tajse943uDq5oupoEboNmlqpS4tiZvJPpC97ygE0dzzPsrcaWkIrea5Tn05Se5t0go/DZDu7Di1YQJAZyVm6ZkX5Y3SAW5cIGpIIfH3+oqy0gxsxaQGMNXY0/57xLo+JP422eOYz7S00Xx3jfZSSSz7JakvrSnInwAI+w==";
        String publicKey = "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCzydb3Xx94UIy4G/9eMi3lwFqr2nad2aVSMyVSGxehqiH8dT1ZewMUUxebLIzz8Xci5v3WmD4gJeUDjgUmMWgXlVPEKm95zempzdaXvK8aABuOAiikiUidoUwwzGS6nyjZbaP8YQoltsMhRHFi+eqA/WIVEzvMbVl4g2kBDvvlnQIDAQAB";

        // 文本
        String text = "Sa-Token 一个轻量级java权限认证框架";
        // 使用公钥加密
        String ciphertext = SaSecureUtil.rsaEncryptByPublic(publicKey, text);
        System.out.println("公钥加密后：" + ciphertext);

        // 使用私钥解密
        String text2 = SaSecureUtil.rsaDecryptByPrivate(privateKey, ciphertext);
        System.out.println("私钥解密后：" + text2);
        HashMap<Object, Object> objectObjectHashMap = new HashMap<>();
        objectObjectHashMap.put("ciphertext", ciphertext);
        objectObjectHashMap.put("text2", text2);
        return SaResult.ok().setData(objectObjectHashMap);
    }
    @SaIgnore // 忽略认证
    @RequestMapping("test3")
    public SaResult test3() {
        SaHttpBasicUtil.check("sa:123456");
        // ... 其它代码
        return SaResult.ok();
    }

    @RequestMapping("test4")
    public SaResult test4() {


        // 解析 JWT Token
        String token = StpUtil.getTokenValue();
        JSONObject payload = SaJwtUtil.getPayloads(token, "login", "hhhhhhhhhhhhhhhhhhhhhh");
//        Object payload = SaJwtUtil.getPayload(token); // 获取 Payload 部分
        System.out.println("JWT Payload: " + payload);

// 获取 JWT Token 中的登录 ID
        Object loginId = SaJwtUtil.getLoginId(token,"login","hhhhhhhhhhhhhhhhhhhhhh");
        System.out.println("JWT 中的登录 ID: " + loginId);

// 获取 JWT Token 中的所有 Claims
//        Map<String, Object> claims = SaJwtUtil.getClaims(token);
//        System.out.println("JWT Claims: " + claims);
        // ... 其它代码

        return SaResult.ok();
    }

}
