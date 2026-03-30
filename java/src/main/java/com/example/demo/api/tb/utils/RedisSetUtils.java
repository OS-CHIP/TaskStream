package com.example.demo.api.tb.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Set;

/**
 * Redis工具类，提供对Redis中Set数据结构和String数据结构的基本操作
 */
@Component
public class RedisSetUtils {

    @Autowired
    private StringRedisTemplate redisTemplate;

    /**
     * 向指定的Set集合中添加元素
     *
     * @param key   Set集合的键名
     * @param value 要添加的元素值
     */
    public void add(String key, String value) {
        redisTemplate.opsForSet().add(key, value);
    }

    /**
     * 从指定的Set集合中移除元素
     *
     * @param key   Set集合的键名
     * @param value 要移除的元素值
     */
    public void remove(String key, String value) {
        redisTemplate.opsForSet().remove(key, value);
    }

    /**
     * 获取指定Set集合中的所有成员
     *
     * @param key Set集合的键名
     * @return 包含所有成员的Set集合，如果键不存在则返回空集合
     */
    public Set<String> members(String key) {
        return redisTemplate.opsForSet().members(key);
    }

    /**
     * 删除指定的键
     *
     * @param key 要删除的键名
     */
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    /**
     * 设置指定键的字符串值，并设置过期时间
     *
     * @param key           键名
     * @param value         键对应的值
     * @param expireSeconds 过期时间（秒）
     */
    public void setEx(String key, String value, long expireSeconds) {
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(expireSeconds));
    }

    /**
     * 获取指定键的值
     *
     * @param key 键名
     * @return 键对应的值，如果键不存在则返回null
     */
    public String get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
}
