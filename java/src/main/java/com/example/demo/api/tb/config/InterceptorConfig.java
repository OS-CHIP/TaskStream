//package com.example.demo.api.tb.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//import javax.annotation.Resource;
//
////@Configuration
//public class InterceptorConfig implements WebMvcConfigurer {
//
//    @Override
//    public void addInterceptors(InterceptorRegistry registry) {
//        registry.addInterceptor(new JWTInterceptor())
//                .addPathPatterns("/**") // 拦截的请求 /service/**   表示拦截service下所有
//                .excludePathPatterns("/user/login"); // 不拦截的请求  如登录接口
//    }
//
//}
