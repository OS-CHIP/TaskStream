package com.example.demo.api.tb.domain;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import java.util.Date;

@Data
public class MsgEventRemind {
    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 被提醒用户ID
     */
    private Long userId;

    /**
     * 触发用户ID
     */
    private Long senderId;

    /**
     * 事件类型：1=点赞，2=评论，3=关注，4=转发，5=@提及
     */
    private Integer eventType;

    /**
     * 目标类型：1=视频，2=动态，3=评论，4=专栏
     */
    private Integer targetType;

    /**
     * 目标资源ID
     */
    private Long targetId;

    /**
     * 摘要（如评论内容截断）
     */
    private String summary;

    /**
     * 跳转链接（前端直接使用）
     */
    private String jumpUrl;

    /**
     * 是否已读
     */
    private Boolean isRead;

    /**
     * 阅读时间
     */
    private Date readTime;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
