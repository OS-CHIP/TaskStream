package com.example.demo.api.tb.config.Executor;

import cn.hutool.core.thread.ThreadFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.LinkedBlockingQueue;


/**
 * 线程池配置类
 * 用于配置和管理通知分发相关的线程池
 */
@Configuration
public class ThreadPoolConfig {

    @Bean("noticeDispatchExecutor")
    public ExecutorService noticeDispatchExecutor() {
        // 创建ThreadPoolExecutor实例，配置通知分发专用线程池
        return new ThreadPoolExecutor(
            4,                     // corePoolSize
            8,                     // maxPoolSize
            60L, TimeUnit.SECONDS,
            new LinkedBlockingQueue<>(1000),
            new ThreadFactoryBuilder().setNamePrefix("notice-dispatch-pool-").build(),
            new ThreadPoolExecutor.CallerRunsPolicy() // 防止丢任务
        );
    }
}
