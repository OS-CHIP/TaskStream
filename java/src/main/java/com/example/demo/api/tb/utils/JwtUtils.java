package com.example.demo.api.tb.utils;

import cn.dev33.satoken.jwt.SaJwtTemplate;
import cn.dev33.satoken.jwt.SaJwtUtil;
import cn.hutool.jwt.JWT;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;


import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;


public class JwtUtils {
    @Resource
    private static HttpServletRequest request;

    public static final long EXPIRE = 1000 * 60 * 60 * 12; // token过期时间  12小时
    public static final String APP_SECRET = "hhhhhhhhhhhhhhhhhhhhhh"; // 加密的密钥

    // 生成token字符串
    public static String getJwtToken(String id, String username) {
        String rnStr = GenerateRandom32.generateRandomString(32);
        // 创建 JWT 构建器
        Claims claims = Jwts.claims();
        claims.put("loginType", "login");
        claims.put("loginId", 4);

        claims.put("rnStr", "asdasdasdasdsadasdas");
        claims.put("name", "zhangsan");
        claims.put("age", 18);
        claims.put("role", "超级管理员");
        String JwtToken = Jwts.builder()
                // 头信息
                .setHeaderParam("typ", "JWT")
                .setHeaderParam("alg", "HS256") // 加密方式
                .setClaims(claims)


//                // 设置过期时间
//                .setIssuedAt(new Date())
////                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE))
//
//                // 设置用户信息 可以加多个
//                .claim("loginId", id)
//                .claim("username", username)
                // 签名方式
                .signWith(SignatureAlgorithm.HS256, APP_SECRET)
                .compact();
        return JwtToken;
    }

    public static void main(String[] args) {
        String jwtToken = getJwtToken("2", "张三");
        System.out.println(jwtToken);
    }

    // 判断token的合法性、有效期等进行判断，直接对token进行判断
    // 注意这里的异常直接交给拦截器中去处理
    public static boolean checkToken(String jwtToken) {
        if (StringUtils.isEmpty(jwtToken)) return false;
        try {
            Jwts.parser().setSigningKey(APP_SECRET).parseClaimsJws(jwtToken);
        } catch (Exception e) {
            throw e; // 抛出异常交给拦截器处理
        }
        return true;
    }

    // 判断token是否存在与有效，从请求头中获取token
    public static boolean checkToken() {
        try {
            String jwtToken = request.getHeader("token");
            if (StringUtils.isEmpty(jwtToken)) return false;
            Jwts.parser().setSigningKey(APP_SECRET).parseClaimsJws(jwtToken);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    // 根据token获取用户信息
    public static String getMemberIdByJwtToken() {
        HttpServletRequest request =
                ((ServletRequestAttributes) (RequestContextHolder.currentRequestAttributes())).getRequest();
        String jwtToken = request.getHeader("token");
        if (StringUtils.isEmpty(jwtToken)) return "";
        Jws<Claims> claimsJws = Jwts.parser().setSigningKey(APP_SECRET).parseClaimsJws(jwtToken);
        Claims claims = claimsJws.getBody(); // 得到用户数据的主体
        return (String) claims.get("id");
    }

    // 根据token获取用户信息 从请求头中获取token
    public static String getMemberNickNameByJwtToken(HttpServletRequest request) {
        String jwtToken = request.getHeader("token");
        if (StringUtils.isEmpty(jwtToken)) return "";
        Jws<Claims> claimsJws = Jwts.parser().setSigningKey(APP_SECRET).parseClaimsJws(jwtToken);
        Claims claims = claimsJws.getBody(); // 得到用户数据的主体
        return (String) claims.get("nickname");
    }


}