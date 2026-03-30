package com.example.demo.api.tb.config.exception;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.util.SaResult;


import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;


import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;



@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {



    @ExceptionHandler(NotLoginException.class)
    public SaResult notLoginException(NotLoginException e) {
        e.printStackTrace();
        return SaResult.error(e.getMessage()).setCode(401);
    }

    /**
     * 处理业务异常
     *
     * @param e 异常对象
     * @return 错误响应
     */
    @ExceptionHandler(BusinessException.class)
    public SaResult handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.warn("业务异常: URI={}, message={}", request.getRequestURI(), e.getMessage());
        // 使用SaToken的SaResult返回统一格式的错误信息
        return SaResult.error(e.getMessage()).setCode(e.getCode());
    }
    /**
     * 处理参数校验异常
     *
     * @param e 异常对象
     * @return 错误响应
     */
    @ExceptionHandler(BindException.class)
    public SaResult handleValidationException(BindException e) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return SaResult.error(e.getMessage()).setData(errors);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public SaResult handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String requestURI = request.getRequestURI();
        // 用于存储字段错误信息
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
//            list.add(String.format("请求参数类型不匹配，参数[%s]要求类型为：'%s'，但输入值为：'%s'",fieldName,errorMessage,((FieldError) error).getRejectedValue()));
        });
        log.error("请求参数类型不匹配'{}',发生系统异常.", requestURI);
        return SaResult.error("参数校验失败").setData(errors);
    }

    @ExceptionHandler(Exception.class)
    public SaResult handlerException(Exception e, HttpServletRequest request) {
        log.error("系统异常: URI={}, message={}", request.getRequestURI(), e.getMessage(), e);
        return SaResult.error(e.getMessage());
    }
}
