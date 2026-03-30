//package com.example.demo.api.tb.config.SaToken;
//
//import cn.dev33.satoken.jwt.SaJwtTemplate;
//import cn.dev33.satoken.jwt.SaJwtUtil;
//import cn.dev33.satoken.jwt.StpLogicJwtForSimple;
//import cn.dev33.satoken.stp.StpLogic;
//import cn.dev33.satoken.stp.StpUtil;
//import cn.hutool.jwt.JWT;
//import org.springframework.context.annotation.Bean;
//import org.springframework.web.servlet.HandlerInterceptor;
//
//import javax.annotation.PostConstruct;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//public class AuthInterceptor implements HandlerInterceptor {
//
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//        // 检查用户是否登录
//        if (!StpUtil.isLogin()) {
//            // 未登录，重定向到认证服务器
//
////            String authServerUrl = "https://auth-server.com/oauth/authorize?response_type=code&client_id=your-client-id&redirect_uri=your-redirect-uri";
////            String authServerUrl = "http://sa-oauth-server.com:8000/oauth2/authorize?response_type=code&client_id=1002&redirect_uri=http://172.28.106.251:5173/&scope=openid,userinfo";
////            String authServerUrl = "http://sa-oauth-server.com:8000/oauth2/authorize?response_type=code&client_id=1002&redirect_uri=http://172.28.2.37:9000/tasks/queryTaskTemplate/1/&scope=openid,userinfo";
////            String authServerUrl = "http://sa-oauth-server.com:8000/oauth2/authorize?response_type=code&client_id=1002&redirect_uri=http://sa-oauth-client.com:9000/oauth2&scope=openid,userinfo";
//            String authServerUrl = "http://sa-oauth-server.com:8000/oauth2/authorize?response_type=token&client_id=1001&redirect_uri=http://sa-oauth-client.com:9000/&scope=userinfo";
//            response.sendRedirect(authServerUrl);
//            return false; // 中断请求
//        }
//        return true; // 继续执行请求
//    }
//}