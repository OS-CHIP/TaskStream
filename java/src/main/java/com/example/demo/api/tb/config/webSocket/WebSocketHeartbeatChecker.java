package com.example.demo.api.tb.config.webSocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.websocket.Session;
import java.io.IOException;
import java.util.Set;


/*
心跳检测任务（超时踢人）
 */
@Component
public class WebSocketHeartbeatChecker {

    private static final String LAST_ACTIVE_KEY_PREFIX = "ws:lastActive:";
    private static final long TIMEOUT_MS = 50 * 1000; // 30秒超时

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Scheduled(fixedDelay = 30000) // 每10秒检查一次
    public void checkHeartbeatTimeout() {
        Set<String> keys = redisTemplate.keys(LAST_ACTIVE_KEY_PREFIX + "*");
        if (keys == null || keys.isEmpty()) return;

        long now = System.currentTimeMillis();

        for (String key : keys) {
            String lastActiveStr = redisTemplate.opsForValue().get(key);
            if (lastActiveStr == null) continue;

            try {
                long lastActive = Long.parseLong(lastActiveStr);
                if (now - lastActive > TIMEOUT_MS) {
                    String userIdStr = key.substring(LAST_ACTIVE_KEY_PREFIX.length());
                    Long userId = Long.valueOf(userIdStr);

                    // 关闭所有该用户的连接（单机）
                    Set<String> sessionIds = NotificationWebSocket.getOnlineSessionIds(userId);
                    if (sessionIds != null) {
                        for (String sid : sessionIds) {
                            Session session = NotificationWebSocket.SESSION_STORE.get(sid);
                            if (session != null && session.isOpen()) {
                                try {
                                    session.close();
                                } catch (IOException ignored) {
                                }
                            }
                        }
                    }

                    // 清理 Redis
                    redisTemplate.delete(key);
                    redisTemplate.delete("ws:online:" + userId);

                    System.out.println("⏰ 用户 " + userId + " 心跳超时，已强制下线");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}