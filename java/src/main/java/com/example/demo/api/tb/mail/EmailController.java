package com.example.demo.api.tb.mail;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("/api/email")
@CrossOrigin(origins = "*") // 允许跨域，开发用，生产要限制
public class EmailController {

    @Resource
    private EmailService emailService;

    /**
     * 发送验证码接口
     * 请求方式：POST
     * 参数：{"email": "user@example.com"}
     */
    @PostMapping("/send-code")
    public String sendCode(@RequestBody EmailRequest request) {
        try {
            String email = request.getEmail();
            emailService.sendVerificationCode(email);
            return "验证码已发送到邮箱: " + email;
        } catch (Exception e) {
            e.printStackTrace();
            return "发送失败: " + e.getMessage();
        }
    }
}