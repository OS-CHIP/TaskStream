package com.example.demo.api.tb.domain.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserNoticeVO {
    private Long id;                // 来自 msg_user_notice.id 或 msg_event_remind.id
    private Integer type;           // 1=系统通知, 2=事件提醒
    private String title;           // 系统通知用 title，事件提醒用 sender 昵称 + 动作
    private String summary;         // 内容摘要
    private String jumpUrl;         // 跳转链接
    private Boolean isRead;         // 是否已读
    private LocalDateTime createTime;
}