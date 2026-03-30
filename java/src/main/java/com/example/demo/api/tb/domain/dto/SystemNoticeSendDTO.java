package com.example.demo.api.tb.domain.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class SystemNoticeSendDTO {
    @NotBlank(message = "标题不能为空")
    private String title;

    @NotBlank(message = "内容不能为空")
    private String content;

    @NotNull(message = "通知类型不能为空")
    private Integer noticeType; // 0=公告, 1=活动等（对应枚举）

    @NotNull(message = "目标类型不能为空")
    private Integer targetType; // 0=全体, 1=指定用户

    private Long targetUserId; // 当 targetType=1 时必填
}