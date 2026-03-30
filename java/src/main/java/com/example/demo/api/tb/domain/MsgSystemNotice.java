package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@TableName("msg_system_notice")
public class MsgSystemNotice {
    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 通知标题
     */
    private String title;

    /**
     * 通知内容
     */
    private String content;

    /**
     * 通知类型
     */
    private Integer noticeType;

    /**
     * 目标类型
     */
    private Integer targetType;

    /**
     * 目标用户ID（单发时使用，可选）
     */
    private Long targetUserId;

    /**
     * 状态：0=未分发, 1=已分发
     */
    private Integer status;

    /**
     * 计划推送时间
     */
    private Date planPushTime;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private Date createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private Date updateTime;
}
