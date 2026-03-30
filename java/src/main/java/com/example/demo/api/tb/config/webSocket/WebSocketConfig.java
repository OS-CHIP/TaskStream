package com.example.demo.api.tb.config.webSocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.server.standard.ServerEndpointExporter;


/**
 * WebSocket配置类
 * 用于配置WebSocket相关的Bean组件
 */
@Configuration
public class WebSocketConfig {
    /**
     * 创建ServerEndpointExporter Bean
     * 该Bean用于自动注册使用@ServerEndpoint注解的WebSocket端点
     *
     * @return ServerEndpointExporter实例
     */
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
    }
}
