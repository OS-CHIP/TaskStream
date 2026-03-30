package com.example.demo;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import cn.dev33.satoken.SaManager;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.net.InetAddress;
import java.net.UnknownHostException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.example.demo.api.tb.mapper")
public class TBApplication {

    private static final Logger logger = LoggerFactory.getLogger(TBApplication.class);

    public static void main(String[] args) throws Exception {
        SpringApplication.run(TBApplication.class, args);

        try {
            InetAddress localHost = InetAddress.getLocalHost();
            String hostAddress = localHost.getHostAddress();
            logger.info("Host Address:  {}", hostAddress);
            logger.info("localHost: {}", localHost);
        } catch (UnknownHostException e) {
            logger.warn("无法获取本地主机地址: {}", e.getMessage());
        }

        logger.info("启动成功，Sa-Token 配置如下：{}", SaManager.getConfig());
    }

}
