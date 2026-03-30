package com.example.demo.api.tb.utils;

import cn.hutool.core.codec.Base62;
import cn.hutool.core.util.IdUtil;

/**
 * 雪花算法 + Base62 编码生成邀请码
 */
public class InviteCodeUtil {

    /**
     * 生成 6～10 位的 Base62 邀请码
     * @param length 期望长度（6～10）
     * @return Base62 编码字符串
     */
    public static String generateInviteCode(int length) {
        // 1. 生成雪花算法 ID
        long snowflakeId = IdUtil.getSnowflake(1, 1).nextId();

        // 2. 转为字符串并截取后缀
        String raw = String.valueOf(snowflakeId);
        int start = Math.max(0, raw.length() - length);
        String suffix = raw.substring(start);

        // 3. Base62 编码（转换为可读性强的字符串）
        return Base62.encode(suffix.getBytes());
    }

    /**
     * 生成 8 位邀请码（默认）
     */
    public static String generateInviteCode() {
        return generateInviteCode(8);
    }
}