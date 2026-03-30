package com.example.demo.api.tb.mail;



import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import javax.annotation.Resource;
import java.util.Random;

@Service
public class EmailService {

    @Resource
    private JavaMailSender mailSender; // Spring Boot 自动注入

    /**
     * 发送验证码到用户邮箱
     * @param toEmail 目标邮箱，如 user@example.com
     */
    public void sendVerificationCode(String toEmail) {
        // 1. 生成一个 6 位数字验证码
        String code = generateVerificationCode();

        // 2. 创建邮件内容
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("oschip.cloud@bosc.ac.cn");  // 发件人（必须和 spring.mail.username 一致）
        message.setTo(toEmail);                // 收件人
        message.setSubject("您的验证码");       // 邮件主题
        message.setText("您的验证码是: " + code + "，请在10分钟内使用。"); // 邮件正文

        // 3. 发送邮件
        mailSender.send(message);

        // 4. （可选）你可以把 code 保存到 Redis / 数据库，关联用户，设置过期时间，用于后续校验
        System.out.println("验证码已发送至 " + toEmail + "，验证码是：" + code);
    }

    /**
     * 生成一个 6 位数字的验证码
     */
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 保证是 6 位数
        return String.valueOf(code);
    }
}