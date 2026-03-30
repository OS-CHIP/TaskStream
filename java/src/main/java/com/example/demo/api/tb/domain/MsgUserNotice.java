package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * 用户通知实体类
 * 用于映射数据库中的用户通知表(msg_user_notice)
 * 包含用户通知的基本信息、阅读状态和时间戳等字段
 */
@Data
@TableName("msg_user_notice")
public class MsgUserNotice {
    /**
     * 主键ID，自动生成
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID，关联用户表
     */
    private Long userId;

    /**
     * 通知ID，关联通知表
     */
    private Long noticeId;

    /**
     * 通知标题
     */
    private String title;

    /**
     * 通知内容
     */
    private String content;

    /**
     * 是否已读标识，默认为false(未读)
     */
    private Boolean isRead = false;

    /**
     * 阅读时间，用户点击阅读后记录的时间
     */
    private Date readTime;

    /**
     * 创建时间，记录通知创建的时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 更新时间，记录通知最后更新的时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
