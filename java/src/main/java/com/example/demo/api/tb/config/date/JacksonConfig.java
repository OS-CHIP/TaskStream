package com.example.demo.api.tb.config.date;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

/**
 * @author ji156
 */
@Configuration
public class JacksonConfig {

    /**
     * 定义日期时间格式，比如："yyyy-MM-dd HH:mm:ss"
     */
    private static final String DATE_TIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final DateTimeFormatter LOCAL_DATETIME_FORMATTER = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT);

    /**
     * 自定义 ObjectMapper 并配置全局 Jackson 行为
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper objectMapper = new ObjectMapper();

        // 1. 设置日期格式（对 java.util.Date 生效）
        objectMapper.setDateFormat(new SimpleDateFormat(DATE_TIME_FORMAT));
        objectMapper.setTimeZone(TimeZone.getTimeZone("GMT+8")); // 或者 "Asia/Shanghai"

        // 2. 支持 Java 8 时间类型（如 LocalDateTime, LocalDate...）
        JavaTimeModule javaTimeModule = new JavaTimeModule();

        // LocalDateTime 序列化器 & 反序列化器
        LocalDateTimeSerializer localDateTimeSerializer = new LocalDateTimeSerializer(LOCAL_DATETIME_FORMATTER);
        LocalDateTimeDeserializer localDateTimeDeserializer = new LocalDateTimeDeserializer(LOCAL_DATETIME_FORMATTER);

        javaTimeModule.addSerializer(LocalDateTime.class, localDateTimeSerializer);
        javaTimeModule.addDeserializer(LocalDateTime.class, localDateTimeDeserializer);

        // 3. 注册 JavaTimeModule 到 ObjectMapper
        objectMapper.registerModule(javaTimeModule);

        // 4. 可选：关闭默认的日期 asTimestamp，让日期以字符串形式输出
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        return objectMapper;
    }
}