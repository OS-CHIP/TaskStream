package com.example.demo.api.tb.domain.dto;


import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

/**
 * 用户密码修改bo
 */
@Data
public class SysUserPasswordDTO {


    /**
     * 旧密码
     */
    @NotBlank(message = "旧密码不能为空")
    private String oldPassword;

    /**
     * 新密码
     */
    @NotBlank(message = "新密码不能为空")
    @Size(min = 5, max = 20, message = "用户密码长度必须在5到20个字符之间")
    private String newPassword;
}
