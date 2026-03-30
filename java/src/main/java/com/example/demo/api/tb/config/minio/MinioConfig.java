package com.example.demo.api.tb.config.minio;


import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MinioConfig {

    @Value("${minio.endpoint}")
    private String endpoint;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;


//    @Bean
//    public MinioClient minioClient() {
//
//        MinioClient minioClient = new MinioClient(endpoint, accessKey, secretKey);
//        return minioClient;
//
//    }
@Bean
public MinioClient minioClient() {
    try {
        return MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();
    } catch (Exception e) {
        throw new RuntimeException("Failed to initialize MinioClient", e);
    }
}
}