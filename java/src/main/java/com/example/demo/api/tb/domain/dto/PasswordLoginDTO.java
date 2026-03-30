package com.example.demo.api.tb.domain.dto;

import lombok.Data;
import org.hibernate.validator.constraints.NotBlank;

import javax.validation.constraints.Size;

/**
 * 密码登录对象
 *
 * @author jizitao
 */
@Data
public class PasswordLoginDTO {

    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 5, max = 20, message = "用户名长度必须在5到20个字符之间")
//    @Pattern(
//            regexp = "^[A-Za-z]+$",                     // 只允许英文字母（大小写）
//            message = "姓名只能包含英文字母（A-Z, a-z）"
//    )
    private String username;

    /**
     * 用户密码
     */
    @NotBlank(message = "用户密码不能为空")
//    @Pattern(
//            regexp = "^[^\\s]+$",                     // 核心：不允许任何空格
//            message = "密码不能包含空格"
//    )
    @Size(min = 5, max = 20, message = "用户密码长度必须在5到20个字符之间")
    private String password;

}
