package com.example.demo.api.tb.domain.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 未读消息计数数据传输对象
 * 用于封装用户各类未读消息的统计信息
 */
@Data
@AllArgsConstructor
public  class UnreadCountDTO {
    /**
     * 未读消息总数
     */
    private long total;

    /**
     * 系统消息未读数
     */
    private int system;

    /**
     * 事件消息未读数
     */
    private int event;
}
