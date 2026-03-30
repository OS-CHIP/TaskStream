//package com.example.demo.api.tb.config.SaToken;
//
//import cn.dev33.satoken.jwt.StpLogicJwtForSimple;
//import cn.hutool.jwt.JWT;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//import javax.annotation.PostConstruct;
//import cn.dev33.satoken.jwt.SaJwtTemplate;
//import cn.dev33.satoken.jwt.SaJwtUtil;
//import cn.dev33.satoken.stp.StpLogic;
////@Configuration
//public class WebConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        // 注册自定义拦截器
//        registry.addInterceptor(new AuthInterceptor())
//                .addPathPatterns("/**") // 拦截所有路径
////                .addPathPatterns("/tasks/**") // 拦截所有路径
//                .excludePathPatterns("/oauth2/**"); // 排除 OAuth2 相关路径
//    }
//    // Sa-Token 整合 jwt (Simple 简单模式)
//    @Bean
//    public StpLogic getStpLogicJwt() {
//        return new StpLogicJwtForSimple();
//    }
//    /**
//     * 自定义 SaJwtUtil 生成 token 的算法
//     */
//    @PostConstruct
//    public void setSaJwtTemplate() {
//        SaJwtUtil.setSaJwtTemplate(new SaJwtTemplate() {
//            @Override
//            public String generateToken(JWT jwt, String keyt) {
//                System.out.println("------ 自定义了 token 生成算法");
//                return super.generateToken(jwt, keyt);
//            }
//        });
//    }
//
//
//}