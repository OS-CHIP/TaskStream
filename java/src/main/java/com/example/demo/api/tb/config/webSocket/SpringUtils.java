package com.example.demo.api.tb.config.webSocket;

import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.stereotype.Component;

/**
 * Spring工具类，用于获取Spring容器中的Bean实例
 * 实现ApplicationContextAware接口，通过Spring自动注入ApplicationContext
 */
@Component
public class SpringUtils implements ApplicationContextAware {
    private static ApplicationContext applicationContext;

    /**
     * 设置应用程序上下文
     * @param ctx Spring应用程序上下文
     */
    @Override
    public void setApplicationContext(ApplicationContext ctx) {
        applicationContext = ctx;
    }

    /**
     * 根据类型获取Spring容器中的Bean实例
     * @param clazz Bean的类型Class对象
     * @param <T> 泛型类型参数
     * @return 指定类型的Bean实例
     */
    public static <T> T getBean(Class<T> clazz) {
        return applicationContext.getBean(clazz);
    }
}
