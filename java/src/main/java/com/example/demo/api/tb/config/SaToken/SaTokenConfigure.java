package com.example.demo.api.tb.config.SaToken;

import cn.dev33.satoken.interceptor.SaInterceptor;
import cn.dev33.satoken.jwt.SaJwtTemplate;
import cn.dev33.satoken.jwt.SaJwtUtil;
import cn.dev33.satoken.jwt.StpLogicJwtForMixin;
import cn.dev33.satoken.jwt.StpLogicJwtForSimple;
import cn.dev33.satoken.stp.StpLogic;
import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.jwt.JWT;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import javax.annotation.PostConstruct;


@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {

    // Sa-Token 整合 jwt (Simple 简单模式)
    @Bean
    public StpLogic getStpLogicJwt() {
        return new StpLogicJwtForSimple();
    }

//    // Sa-Token 整合 jwt (Mixin 混入模式)
//    @Bean
//    public StpLogic getStpLogicJwt() {
//        return new StpLogicJwtForMixin();
//    }




//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(new JWTInterceptor())
//                .addPathPatterns("/**") // 拦截的请求 /service/**   表示拦截service下所有
//                .excludePathPatterns("/acc/login"); // 不拦截的请求  如登录接口
//    }
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // 注册 Sa-Token 的路由拦截器
        registry.addInterceptor(new SaInterceptor(handle -> StpUtil.checkLogin()))
                .addPathPatterns("/**")
                .excludePathPatterns("/users/doLogin")
                .excludePathPatterns("/users/register")
                .excludePathPatterns("/oauth2/*")
                .excludePathPatterns("/error");
    }
//@Override
//public void addInterceptors(InterceptorRegistry registry) {
//    // 注册自定义拦截器
//    registry.addInterceptor(new AuthInterceptor())
//            .addPathPatterns("/**") // 拦截所有路径
////                .addPathPatterns("/tasks/**") // 拦截所有路径
//            .excludePathPatterns("/oauth2/**"); // 排除 OAuth2 相关路径
//}



    /**
     * 自定义 SaJwtUtil 生成 token 的算法
     */
    @PostConstruct
    public void setSaJwtTemplate() {
        SaJwtUtil.setSaJwtTemplate(new SaJwtTemplate() {
            @Override
            public String generateToken(JWT jwt, String keyt) {
                System.out.println("------ 自定义了 token 生成算法");
                return super.generateToken(jwt, keyt);
            }
        });
    }

//        /**
//         * 重写 Sa-Token 框架内部算法策略
//         */
//        @PostConstruct
//        public void rewriteSaStrategy() {
//            // 重写 Token 生成策略
//            SaStrategy.instance.createToken = (loginId, loginType) -> {
//                return SaFoxUtil.getRandomString(60);    // 随机60位长度字符串
//            };
//        }



//    /**
//     * 注册 Sa-Token 拦截器，打开注解式鉴权功能
//     * 如果在高版本 SpringBoot (≥2.6.x) 下注册拦截器失效，则需要额外添加 @EnableWebMvc 注解才可以使用
//     * @param registry
//     */
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        // 注册路由拦截器，自定义认证规则
//        registry.addInterceptor(new SaInterceptor(handler -> {
//                    // 登录认证 -- 拦截所有路由，并排除/user/doLogin 用于开放登录
//                    SaRouter.match("/**", "/user/doLogin", r -> StpUtil.checkLogin());
//                    // 角色认证 -- 拦截以 admin 开头的路由，必须具备 admin 角色或者 super-admin 角色才可以通过认证
//                    SaRouter.match("/admin/**", r -> StpUtil.checkRoleOr("admin", "super-admin"));
//                    // 权限认证 -- 不同模块认证不同权限
//                    SaRouter.match("/user/**", r -> StpUtil.checkRole("user"));
//                    SaRouter.match("/admin/**", r -> StpUtil.checkPermission("admin"));
//                    // 甚至你可以随意的写一个打印语句
//                    SaRouter.match("/**", r -> System.out.println("--------权限认证成功-------"));
//                }).isAnnotation(true))
//                //拦截所有接口
//                .addPathPatterns("/**")
//                //不拦截/user/doLogin登录接口
//                .excludePathPatterns("/users/doLogin");
//    }


}
