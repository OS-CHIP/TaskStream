package com.example.demo.api.tb.config.webSocket;


import cn.dev33.satoken.stp.StpUtil;
import com.alibaba.fastjson2.JSONObject;
import com.example.demo.api.tb.utils.RedisSetUtils;
import org.springframework.stereotype.Component;

import javax.websocket.*;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * WebSocket通知服务端点，用于处理客户端连接、心跳检测、获取未读数等操作。
 * 支持通过Redis记录用户在线状态及最后活跃时间，并维护单机Session映射。
 */
@Component
@ServerEndpoint(
        value = "/ws",
        configurator = SpringWebSocketConfigurator.class
)
public class NotificationWebSocket {

    /**
     * 在线用户在Redis中的键前缀（格式：ws:online:{userId}）
     */
    private static final String ONLINE_KEY_PREFIX = "ws:online:";

    /**
     * 最后活跃时间在Redis中的键前缀（格式：ws:lastActive:{userId}）
     */
    private static final String LAST_ACTIVE_KEY_PREFIX = "ws:lastActive:";

    /**
     * 心跳超时秒数，用于设置Redis中活跃时间的有效期
     */
    private static final int HEARTBEAT_TIMEOUT_SECONDS = 30;

    /**
     * 单机环境下存储sessionId与Session对象的映射关系
     */
    public static final Map<String, Session> SESSION_STORE = new ConcurrentHashMap<>();

    /**
     * 获取Redis工具类实例
     *
     * @return RedisSetUtils 实例
     */
    private static RedisSetUtils redisSetUtils() {
        return SpringUtils.getBean(RedisSetUtils.class);
    }

    /**
     * 当WebSocket连接打开时触发此方法。
     * 验证用户身份并注册会话信息至本地缓存和Redis中。
     *
     * @param session 客户端建立的WebSocket会话
     * @param config  WebSocket配置信息
     */
    @OnOpen
    public void onOpen(Session session, EndpointConfig config) {
        Long userId = (Long) session.getUserProperties().get("userId");

        if (userId == null) {
            try {
                session.close();
            } catch (IOException ignored) {
            }
            return;
        }

        String sessionId = session.getId();
        String onlineKey = ONLINE_KEY_PREFIX + userId;
        String lastActiveKey = LAST_ACTIVE_KEY_PREFIX + userId;

        // 将当前会话加入该用户的在线集合，并更新其最后活跃时间
        redisSetUtils().add(onlineKey, sessionId);
        redisSetUtils().setEx(lastActiveKey, String.valueOf(System.currentTimeMillis()), HEARTBEAT_TIMEOUT_SECONDS * 2);
//        redisSetUtils().setEx(lastActiveKey, String.valueOf(System.currentTimeMillis()), -1);

        // 缓存到本地内存中便于快速访问
        SESSION_STORE.put(sessionId, session);

        System.out.println("✅ 用户 " + userId + " 上线，SessionID: " + sessionId);
        sendText(session, buildResponse("system", Map.of("msg", "已连接")));
    }

    /**
     * 处理来自客户端的消息。
     * 根据命令类型执行不同逻辑，如心跳响应或查询未读数量。
     *
           * @param message 接收到的文本消息内容
     * @param session 发送消息的WebSocket会话
     */
    @OnMessage
    public void onMessage(String message, Session session) {
        Long userId = (Long) session.getUserProperties().get("userId");
        if (userId == null) return;

        try {
            JSONObject json = JSONObject.parseObject(message);
            String cmd = json.getString("cmd");

            if ("ping".equals(cmd)) {
                // 更新活跃时间以保持连接有效性
                String lastActiveKey = LAST_ACTIVE_KEY_PREFIX + userId;
                redisSetUtils().setEx(lastActiveKey, String.valueOf(System.currentTimeMillis()), HEARTBEAT_TIMEOUT_SECONDS * 2);
                sendText(session, "pong");
//                System.out.println("Ping received from user " + userId);
                return;
            }
//
//            if ("getUnreadCount".equals(cmd)) {
//                handleGetUnreadCount(session, userId);
//                return;
//            }

            sendText(session, buildErrorResponse("未知指令: " + cmd));
        } catch (Exception e) {
            sendText(session, buildErrorResponse("消息解析失败"));
            e.printStackTrace();
        }
    }


    /**
     * 当WebSocket连接关闭时触发此方法。
     * 清理会话相关资源，包括从Redis移除在线标识以及删除空集合。
     *
     * @param session 被关闭的WebSocket会话
     */
    @OnClose
    public void onClose(Session session) {
        Long userId = (Long) session.getUserProperties().get("userId");
        if (userId != null) {
            String sessionId = session.getId();
            String onlineKey = ONLINE_KEY_PREFIX + userId;
            String lastActiveKey = LAST_ACTIVE_KEY_PREFIX + userId;

            redisSetUtils().remove(onlineKey, sessionId);
            Set<String> remaining = redisSetUtils().members(onlineKey);
            if (remaining == null || remaining.isEmpty()) {
                redisSetUtils().delete(onlineKey);
                redisSetUtils().delete(lastActiveKey);
            }

            SESSION_STORE.remove(sessionId);
            System.out.println("🔌 用户 " + userId + " 下线，SessionID: " + sessionId);
        }
    }

    /**
     * 当WebSocket发生错误时触发此方法。
     * 打印异常信息并尝试清理会话资源。
     *
     * @param session 出现错误的WebSocket会话
     * @param error   异常对象
     */
    @OnError
    public void onError(Session session, Throwable error) {
        System.err.println("WebSocket 错误: " + error.getMessage());
        onClose(session);
    }

    // ------------------ 工具方法 ------------------

    /**
     * 向指定WebSocket会话发送文本消息。
     *
     * @param session WebSocket会话
     * @param text    待发送的文本内容
     */
    private void sendText(Session session, String text) {
        try {
            if (session.isOpen()) {
                session.getBasicRemote().sendText(text);
            }
        } catch (IOException ignored) {
        }
    }

    /**
     * 给指定用户的所有在线会话发送通知。
     */
    public static void sendToUser(Long userId, String type, Object data) {
        if (userId == null) {
            System.err.println("⚠️ [发送给用户] userId 不能为空");
            return;
        }
        String loginId = StpUtil.getLoginIdAsString();
        // 如果是登录用户，则不发送通知
        if (loginId.equals(userId.toString())) {
            return;
        }

        // 1. 从 Redis 获取该用户的所有在线 sessionId
        String onlineKey = ONLINE_KEY_PREFIX + userId;
        Set<String> sessionIds = redisSetUtils().members(onlineKey);

        if (sessionIds == null || sessionIds.isEmpty()) {
            System.out.println("📭 [发送给用户] 用户 " + userId + " 当前不在线或无活动会话。");
            return;
        }

        // 2. 构建要发送的 JSON 消息字符串
        String messageToSend;
        try {
            messageToSend = buildResponse(type, data); // 复用类内的静态工具方法
        } catch (Exception e) {
            System.err.println("❌ [发送给用户] 为用户 " + userId + " 构建消息失败: " + e.getMessage());
            return;
        }

        System.out.println("✉️ [发送给用户] 准备向用户 " + userId + " 的 " + sessionIds.size() + " 个会话发送消息: " + messageToSend);

        boolean messageSent = false; // 标记是否至少发送成功了一次

        // 3. 遍历 sessionId，查找并发送消息
        for (String sessionId : sessionIds) {
            Session session = SESSION_STORE.get(sessionId);

            if (session != null && session.isOpen()) {
                try {
                    session.getBasicRemote().sendText(messageToSend);
                    System.out.println("   -> 消息已发送至用户 " + userId + " 的 Session ID: " + sessionId);
                    messageSent = true;
                } catch (Exception e) {
                    System.err.println("❌ [发送给用户] 向用户 " + userId + " 的 Session ID " + sessionId + " 发送消息时出错: " + e.getMessage());
                    // 尝试关闭并从本地存储中移除有问题的 Session
                    // 注意：Redis 中的记录通常由 onClose 清理，但如果发送失败可能 onClose 未触发
                    try {
                        if (session.isOpen()) {
                            session.close(new CloseReason(CloseReason.CloseCodes.CLOSED_ABNORMALLY, "Send to user failed"));
                        }
                    } catch (IOException ioException) {
                        System.err.println("   -> 关闭用户 " + userId + " 的 Session ID " + sessionId + " 时也出错: " + ioException.getMessage());
                    }
                    SESSION_STORE.remove(sessionId); // 从本地缓存移除
                }
            } else {
                // Session 不存在或已关闭，可能是过期或异常断开，从本地缓存清理
                System.out.println("   -> 用户 " + userId + " 的 Session ID " + sessionId + " 已关闭或不存在于本地缓存，正在清理...");
                SESSION_STORE.remove(sessionId);
                // 注意：Redis 中的记录应在 onClose 中被清理。如果这里频繁出现，可能需要加强 onClose 的健壮性。
            }
        }

        if (messageSent) {
            System.out.println("✉️ [发送给用户] 消息已成功发送给用户 " + userId + " 的至少一个设备。");
        } else {
            System.out.println("📭 [发送给用户] 未能向用户 " + userId + " 的任何设备发送消息。");
        }
    }

    /**
     * 给所有当前在线的用户广播一条消息。
     * "type": "announcement",
     * "data": {
     * "title": "系统维护通知",
     * "content": "今晚凌晨 2:00 - 4:00 进行系统维护，请提前做好准备。"
     * }
     */
    public static void broadcastToAll(String type, Object data) {
        // 1. 检查是否有在线用户
        if (SESSION_STORE.isEmpty()) {
            System.out.println("📢 [广播] 当前无在线用户。");
            return;
        }

        // 2. 构建要发送的 JSON 消息字符串
        String messageToSend;
        try {
            messageToSend = buildResponse(type, data); // 复用类内的静态工具方法
        } catch (Exception e) {
            System.err.println("❌ [广播] 构建广播消息失败: " + e.getMessage());
            return;
        }

        System.out.println("📢 [广播] 准备向 " + SESSION_STORE.size() + " 个在线用户发送消息: " + messageToSend);

        // 3. 遍历所有存储的 Session 并尝试发送消息
        //    使用 Iterator 以便在遍历时安全地移除失效的 Session
        Iterator<Map.Entry<String, Session>> iterator = SESSION_STORE.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Session> entry = iterator.next();
            String sessionId = entry.getKey();
            Session session = entry.getValue();

            try {
                // 4. 检查 Session 是否仍然有效
                if (session != null && session.isOpen()) {
                    // 5. 发送消息
                    session.getBasicRemote().sendText(messageToSend);
                    // System.out.println("   -> 消息已发送至 Session ID: " + sessionId); // 可选日志
                } else {
                    // 6. 如果 Session 已关闭或无效，则从存储中移除
                    System.out.println("   -> Session ID: " + sessionId + " 已关闭或无效，正在清理本地缓存...");
                    iterator.remove(); // 安全地从 ConcurrentHashMap 中移除
                    // 注意：Redis 中的记录会在对应的 onClose 方法中被清理。
                }
            } catch (Exception e) {
                // 7. 捕获发送过程中的任何异常（如网络问题）
                System.err.println("❌ [广播] 向 Session ID " + sessionId + " 发送消息时出错: " + e.getMessage());
                // 尝试关闭并移除有问题的 Session
                try {
                    if (session != null && session.isOpen()) {
                        session.close(new CloseReason(CloseReason.CloseCodes.CLOSED_ABNORMALLY, "Send broadcast failed"));
                    }
                } catch (IOException ioException) {
                    System.err.println("   -> 关闭 Session ID " + sessionId + " 时也出错: " + ioException.getMessage());
                }
                iterator.remove(); // 无论是否能关闭，都从本地存储中移除
            }
        }

        System.out.println("📢 [广播] 消息发送完毕。");
    }

    /**
     * 构造标准格式的响应JSON字符串。
     *
     * @param type 响应类型（例如 system/response/error）
     * @param data 数据体
     * @return JSON格式的响应字符串
     */
    private static String buildResponse(String type, Object data) {
        JSONObject resp = new JSONObject();
        resp.put("type", type);
        resp.put("data", data);
        return resp.toString();
    }

    /**
     * 构造错误响应JSON字符串。
     *
     * @param msg 错误描述信息
     * @return JSON格式的错误响应字符串
     */
    private String buildErrorResponse(String msg) {
        JSONObject errorData = new JSONObject();
        errorData.put("msg", msg);
        return buildResponse("error", errorData);
    }

    /**
     * 获取指定用户的所有在线会话ID列表。
     *
     * @param userId 用户ID
     * @return 在线会话ID集合
     */
    public static Set<String> getOnlineSessionIds(Long userId) {
        return redisSetUtils().members(ONLINE_KEY_PREFIX + userId);
    }

    //    /**
//     * 查询指定用户的未读消息数量并向客户端发送结果。
//     *
//     * @param session WebSocket会话
//     * @param userId  用户ID
//     */
//    private void handleGetUnreadCount(Session session, Long userId) {
//        int unreadCount = simulateGetUnreadCount(userId); // 替换为你的业务逻辑
//        JSONObject data = new JSONObject();
//        data.put("cmd", "getUnreadCount");
//        data.put("unreadCount", unreadCount);
//        sendText(session, buildResponse("response", data));
//    }

//    /**
//     * 模拟获取未读消息数量的方法，请替换为实际业务实现。
//     *
//     * @param userId 用户ID
//     * @return 未读消息数量
//     */
//    private int simulateGetUnreadCount(Long userId) {
//        return 42; // 示例
//    }
}
