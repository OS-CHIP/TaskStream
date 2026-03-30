package com.example.demo.api.tb.domain.dto;


import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;


/**
 * 用户注册对象
 *
 * @author jizitao
 */
@Data
public class RegisterDTO {


    /**
     * 用户名
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 5, max = 20, message = "用户名长度必须在5到20个字符之间")
    @Pattern(
            regexp = "^[A-Za-z0-9]+$",                     // 允许英文字母和数字
            message = "姓名只能包含英文字母（A-Z, a-z）和数字（0-9）"
    )
    private String username;

    /**
     * 用户密码
     */
    @NotBlank(message = "用户密码不能为空")
    @Size(min = 5, max = 20, message = "用户密码长度必须在5到20个字符之间")
//    @Pattern(
//            regexp = "^[^\\s]+$",                     // 核心：不允许任何空格
//            message = "密码不能包含空格"
//    )
    private String password;

    /**
     * 邮箱
     */
    @NotBlank(message = "用户邮箱不能为空")
    @Email(message = "用户邮箱格式错误")
    private String email;

}