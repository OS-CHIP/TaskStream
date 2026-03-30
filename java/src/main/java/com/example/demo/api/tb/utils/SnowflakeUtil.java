package com.example.demo.api.tb.utils;

import cn.hutool.core.util.IdUtil;

/**
 * 雪花算法工具类（用于生成唯一邀请码）
 */
public class SnowflakeUtil {

    /**
     * 生成一个全局唯一的 Long ID
     * @return 64位雪花算法ID
     */
    public static long nextId() {
        return IdUtil.getSnowflake(1, 1).nextId();
    }

    /**
     * 生成指定长度的邀请码（如6位）
     * @param length 期望长度（6～10）
     * @return 字符串
     */
    public static String nextInviteCode(int length) {
        long id = nextId();
        String raw = String.valueOf(id);
        int start = Math.max(0, raw.length() - length);
        return raw.substring(start);
    }
}