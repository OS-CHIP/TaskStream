package com.example.demo.api.tb.config.annotation;

import cn.dev33.satoken.stp.StpUtil;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.constant.ProjectConstants;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class NotForSuperAdminAspect {

    @Around("@annotation(notForSuperAdmin)")
    public Object checkNotSuperAdmin(ProceedingJoinPoint joinPoint, NotForSuperAdmin notForSuperAdmin) throws Throwable {
        if (StpUtil.hasRole(ProjectConstants.SUPER_ADMIN_ROLE_KEY)) {
            throw new BusinessException(notForSuperAdmin.message());
        }
        return joinPoint.proceed();
    }
}