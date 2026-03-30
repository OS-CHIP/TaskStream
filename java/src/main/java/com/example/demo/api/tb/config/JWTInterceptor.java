//package com.example.demo.api.tb.config;
//
//import cn.dev33.satoken.jwt.SaJwtTemplate;
//import cn.dev33.satoken.jwt.SaJwtUtil;
//import cn.hutool.jwt.JWT;
//import com.example.demo.api.tb.utils.JwtUtils;
//import com.fasterxml.jackson.databind.ObjectMapper;
//import io.jsonwebtoken.ExpiredJwtException;
//import io.jsonwebtoken.MalformedJwtException;
//import io.jsonwebtoken.SignatureException;
//import io.jsonwebtoken.UnsupportedJwtException;
//import org.springframework.stereotype.Component;
//import org.springframework.web.servlet.HandlerInterceptor;
//
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import java.util.HashMap;
//import java.util.Map;
//
////@Component
//public class JWTInterceptor implements HandlerInterceptor {
//    //拦截器，用于拦截请求，进行JWT验证
//    @Override
//    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
//        if(request.getMethod().toUpperCase().equals("OPTIONS")){
//            return true; // 通过所有OPTION请求
//        } else {
//            Map<String, Object> map = new HashMap<>();
//            String token = request.getHeader("token"); // 获取请求头中的token
//            if (token == null || "".equals(token)){
//
//                map.put("msg", "token为空");
//                map.put("state", false);
//                // 将map转为json
//                String json = new ObjectMapper().writeValueAsString(map);
//                response.setContentType("application/json;charset=UTF-8");
//                response.getWriter().println(json);
//                return false; // 未通过验证
//            }
//
//            try {
//                boolean verify = JwtUtils.checkToken(token);
//                if (verify) {
//                    return true; // 通过验证
//                } else {
//                    return false; // 未通过验证
//                }
//            } catch (SignatureException e) {
//                e.printStackTrace();
//                map.put("msg", "无效签名");
//            } catch (UnsupportedJwtException e) {
//                e.printStackTrace();
//                map.put("msg", "不支持的签名");
//            } catch (ExpiredJwtException e) {
//                e.printStackTrace();
//                map.put("msg", "token过期");
//            } catch (MalformedJwtException e) { // IllegalArgumentException
//                e.printStackTrace();
//                map.put("msg", "不支持的签名格式");
//            } catch (Exception e) {
//                e.printStackTrace();
//                map.put("msg", "token无效");
//            }
//            map.put("state", false);
//            // 将map转为json
//            String json = new ObjectMapper().writeValueAsString(map);
//            response.setContentType("application/json;charset=UTF-8");
//            response.getWriter().println(json);
//            return false;
//        }
//    }
//
//}
