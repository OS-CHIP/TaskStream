package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.domain.MsgUserNotice;
import com.example.demo.api.tb.domain.dto.SystemNoticeSendDTO;
import com.example.demo.api.tb.domain.dto.UnreadCountDTO;
import com.example.demo.api.tb.domain.vo.UserNoticeVO;

import javax.validation.constraints.NotNull;
import java.util.Set;

/**
 * @author ji156
 * @description 针对表【comment】的数据库操作Service
 * @createDate 2025-02-10 17:00:07
 */

public interface MessageService {


    void publishNotice(SystemNoticeSendDTO dto);

    void markAsRead(Long userId, Integer type, Long id);

    void markAllAsRead(Long userId);

    UnreadCountDTO getUnreadCount(Long userId);


    Object queryNoticeList(Long userId, Boolean isRead, int page, int size);

    void createRemind(
            Long receiverId,   // 被提醒人（B）
            Long senderId,     // 操作人（A）
            int eventType
            ,int targetType,
            long targetId,
            String summary,
            String jumpUrl
    );

    Set<String>  parseMentionedUsers(String content);
}
