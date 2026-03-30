package com.example.demo.api.tb.config.webSocket;

import cn.dev33.satoken.SaManager;
import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;

import javax.websocket.HandshakeResponse;
import javax.websocket.server.HandshakeRequest;
import javax.websocket.server.ServerEndpointConfig;
import java.util.List;
import java.util.Map;

public class SpringWebSocketConfigurator extends ServerEndpointConfig.Configurator {

    @Override
    public void modifyHandshake(ServerEndpointConfig sec,
                                HandshakeRequest request,
                                HandshakeResponse response) {
        // 从 URL 参数获取 satoken
        // 获取参数Map
        Map<String, List<String>> parameterMap = request.getParameterMap();
        String requestToken = null;
        // 添加空值检查
        if (parameterMap != null) {
            List<String> values = parameterMap.get("token");
            if (values != null && !values.isEmpty()) {
                // 安全访问List元素
                requestToken = values.get(0);

//        String requestToken = request.getParameterMap().get("token").get(0);
        String token = StpUtil.getTokenValue();
        if (token != null && !token.isEmpty() && token.equals(requestToken)) {
            try {
                // 手动解析 Sa-Token
                SaTokenInfo tokenInfo = SaManager.getStpLogic("login").getTokenInfo();
                if (tokenInfo != null && tokenInfo.getLoginId() != null && tokenInfo.getLoginId().equals(StpUtil.getLoginId())) {
                    // 将 userId 存入用户属性，供 @OnOpen 使用
                    sec.getUserProperties().put("userId",Long.parseLong(tokenInfo.getLoginId().toString()));
                    return;
                }
            } catch (Exception e) {
                // Token 无效
            }
        }
            }
        }
        // 鉴权失败：不设置 userId，onOpen 会关闭连接
    }

    @Override
    public <T> T getEndpointInstance(Class<T> clazz) throws InstantiationException {
        // 让 WebSocket 实例由 Spring 管理（支持 @Autowired）
        return SpringUtils.getBean(clazz);
    }
}