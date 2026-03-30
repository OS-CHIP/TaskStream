package com.example.demo.api.tb.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.example.demo.api.tb.config.webSocket.NotificationWebSocket;
import com.example.demo.api.tb.domain.MsgEventRemind;
import com.example.demo.api.tb.domain.MsgSystemNotice;
import com.example.demo.api.tb.domain.MsgUserNotice;
import com.example.demo.api.tb.domain.SysUser;
import com.example.demo.api.tb.domain.dto.SystemNoticeSendDTO;
import com.example.demo.api.tb.domain.dto.UnreadCountDTO;
import com.example.demo.api.tb.domain.vo.UserNoticeVO;
import com.example.demo.api.tb.mapper.MsgEventRemindMapper;
import com.example.demo.api.tb.mapper.MsgSystemNoticeMapper;
import com.example.demo.api.tb.mapper.MsgUserNoticeMapper;
import com.example.demo.api.tb.mapper.UserMapper;
import com.example.demo.api.tb.result.PageResult;
import com.example.demo.api.tb.service.MessageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Slf4j
public class MessageServiceImpl implements MessageService {

    @Resource
    private UserMapper userMapper;

    @Resource
    private MsgSystemNoticeMapper systemNoticeMapper;
    @Resource
    private MsgUserNoticeMapper userNoticeMapper;
    @Resource
    private MsgEventRemindMapper eventRemindMapper;
    @Resource
    private ExecutorService noticeDispatchExecutor;
    // 用于解析 @用户名 的正则表达式
    private static final Pattern AT_PATTERN = Pattern.compile("@([a-zA-Z0-9_]+)");
    /**
     * 发送系统通知
     *
     * @param dto
     */
    @Override
    @Transactional
    public void publishNotice(SystemNoticeSendDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("参数不能为空");
        }

        MsgSystemNotice notice = new MsgSystemNotice();
        BeanUtil.copyProperties(dto, notice);
        notice.setStatus(0); // 待分发
        notice.setPlanPushTime(notice.getPlanPushTime() == null ? new Date() : notice.getPlanPushTime());

        systemNoticeMapper.insert(notice);

        // 提交异步任务前先保证基础信息入库成功
        noticeDispatchExecutor.submit(() -> {
            try {
                dispatchNotice(notice);
            } catch (Exception ex) {
                log.error("公告分发失败: id={}, title={}", notice.getId(), notice.getTitle(), ex);
                // 可选：发送报警通知
            }
        });
    }

    /**
     *
     * 公告分发
     *
     * @param notice
     */
    private void dispatchNotice(MsgSystemNotice notice) {
        try {
            List<Long> userIds = new ArrayList<>();
            if (notice.getTargetType() == 0) {
                userIds = userMapper.selectList(null).stream().map(SysUser::getId).toList();
            } else if (notice.getTargetType() == 1 && notice.getTargetUserId() != null) {
                userIds.add(notice.getTargetUserId());
            } else {
                return; // 无效目标
            }

            List<MsgUserNotice> batch = userIds.stream()
                    .map(uid -> {
                        MsgUserNotice un = new MsgUserNotice();
                        un.setUserId(uid);
                        un.setNoticeId(notice.getId());
                        un.setTitle(notice.getTitle());
                        un.setContent(notice.getContent());
                        return un;
                    })
                    .collect(Collectors.toList());

            // 批量插入（MyBatis-Plus 支持）
            userNoticeMapper.insertBatchSomeColumn(batch); // 或分批 saveBatch

            // 更新状态为已分发
            MsgSystemNotice update = new MsgSystemNotice();
            update.setId(notice.getId());
            update.setStatus(1);
            systemNoticeMapper.updateById(update);

        } catch (Exception e) {
            // 记录日志，告警等
            log.error("公告分发失败: id={}, title={}", notice.getId(), notice.getTitle(), e);
        }
    }

    /**
     * 标记单条通知为已读
     *
     * @param userId 当前用户ID（从 Sa-Token 获取）
     * @param type   1=系统通知, 2=事件提醒
     * @param id     对应记录的主键ID
     */
    @Override
    public void markAsRead(Long userId, Integer type, Long id) {
        if (type == 1) {
            // 系统通知：校验归属 & 更新
            MsgUserNotice notice = userNoticeMapper.selectById(id);
            if (notice == null || !notice.getUserId().equals(userId)) {
                throw new RuntimeException("通知不存在或无权限");
            }
            if (!Boolean.TRUE.equals(notice.getIsRead())) {
                notice.setIsRead(true);
                notice.setReadTime(new Date());
                userNoticeMapper.updateById(notice);
            }

        } else if (type == 2) {
            // 事件提醒
            MsgEventRemind remind = eventRemindMapper.selectById(id);
            if (remind == null || !remind.getUserId().equals(userId)) {
                throw new RuntimeException("提醒不存在或无权限");
            }
            if (remind.getIsRead() != true) {
                remind.setIsRead(true);
                remind.setReadTime(new Date());
                eventRemindMapper.updateById(remind);
            }

        } else {
            throw new IllegalArgumentException("不支持的通知类型");
        }
    }

    /**
     * 一键清空当前用户所有未读通知（系统 + 事件）
     */
    @Override
    @Transactional
    public void markAllAsRead(Long userId) {
        Date now = new Date();
        // 1. 批量更新系统通知（未读 → 已读）
        LambdaUpdateWrapper<MsgUserNotice> sysWrapper = new LambdaUpdateWrapper<MsgUserNotice>()
                .eq(MsgUserNotice::getUserId, userId)
                .eq(MsgUserNotice::getIsRead, false);
        MsgUserNotice updateSys = new MsgUserNotice();
        updateSys.setIsRead(true);
        updateSys.setReadTime(now);
        userNoticeMapper.update(updateSys, sysWrapper);

        // 2. 批量更新事件提醒（is_read=0 → is_read=1）
        LambdaUpdateWrapper<MsgEventRemind> eventWrapper = new LambdaUpdateWrapper<MsgEventRemind>()
                .eq(MsgEventRemind::getUserId, userId)
                .eq(MsgEventRemind::getIsRead, 0);
        MsgEventRemind updateEvent = new MsgEventRemind();
        updateEvent.setIsRead(true);
        updateEvent.setReadTime(now);
        eventRemindMapper.update(updateEvent, eventWrapper);
    }


    /**
     * 获取当前用户未读数量
     *
     * @return
     */
    @Override
    public UnreadCountDTO getUnreadCount(Long userId) {
        // 系统通知未读数
        Long systemCount = userNoticeMapper.selectCount(
                new LambdaQueryWrapper<MsgUserNotice>()
                        .eq(MsgUserNotice::getUserId, userId)
                        .eq(MsgUserNotice::getIsRead, false)
        );

        // 事件提醒未读数
        Long eventCount = eventRemindMapper.selectCount(
                new LambdaQueryWrapper<MsgEventRemind>()
                        .eq(MsgEventRemind::getUserId, userId)
                        .eq(MsgEventRemind::getIsRead, false)
        );
        long total = systemCount + eventCount;
        return new UnreadCountDTO(total, systemCount.intValue(), eventCount.intValue());
    }

    /**
     * 查询当前用户通知列表
     *
     * @param ·userId
     * @param isRead
     * @param page
     * @param size
     * @return
     */
    @Override
    public PageResult<UserNoticeVO> queryNoticeList(Long userId, Boolean isRead, int page, int size) {
        int offset = (page - 1) * size;

        // 为保证不漏数据，每张表多查一些（如 size + 20）
        int fetchSize = size + 20;

        // 查系统通知
        List<UserNoticeVO> sysList = userNoticeMapper.selectPageByUserId(
                userId, isRead, 0, fetchSize
        );
        sysList.forEach(item -> item.setType(1));

        // 查事件提醒
//        Byte isReadByte = isRead == null ? null : (isRead ? (byte) 1 : (byte) 0);
        List<UserNoticeVO> eventList = eventRemindMapper.selectPageByUserId(
                userId, isRead, 0, fetchSize
        );
        eventList.forEach(item -> item.setType(2));

        // 合并 + 按时间倒序
        List<UserNoticeVO> merged = new ArrayList<>();
        merged.addAll(sysList);
        merged.addAll(eventList);

        merged.sort((a, b) -> b.getCreateTime().compareTo(a.getCreateTime()));

        // 分页截取
        // 计算分页的起始位置
        int start = offset;
        // 计算分页的结束位置，确保不超过列表实际大小
        int end = Math.min(offset + size, merged.size());
        // 根据计算的起始和结束位置截取子列表，如果起始位置超出范围则返回空列表
        List<UserNoticeVO> result = start < merged.size() ? merged.subList(start, end) : List.of();


        // 是否还有下一页（粗略判断）
        boolean hasNext = merged.size() > offset + size;

        return new PageResult<>(result, hasNext);
    }


    /**
     * 创建事件提醒（自动跳过自己操作自己的情况）
     */
    @Override
    public void createRemind(
            Long receiverId,   // 被提醒人（B）
            Long senderId,     // 操作人（A）
            int eventType,
            int targetType,
            long targetId,
            String summary,
            String jumpUrl
    ) {
        if (Objects.equals(receiverId, senderId)) return; // 不提醒自己

        MsgEventRemind remind = new MsgEventRemind();
        remind.setUserId(receiverId);
        remind.setSenderId(senderId);
        remind.setEventType(eventType);
        remind.setTargetType(targetType);
        remind.setTargetId(targetId);
        remind.setSummary(summary);
        remind.setJumpUrl(jumpUrl);
        remind.setIsRead(false);
        remind.setCreateTime(new Date());
        eventRemindMapper.insert(remind);

        UserNoticeVO userNoticeVO = eventRemindMapper.selectRemindById(remind.getId());
        NotificationWebSocket.sendToUser(receiverId, "2",userNoticeVO.getTitle());
    }

    @Override
    public Set<String> parseMentionedUsers(String content) {
        Set<String> usernames = java.util.Collections.emptySet();
        if (content == null || content.isEmpty()) {
            return usernames;
        }

        Matcher matcher = AT_PATTERN.matcher(content);
        usernames = matcher.results()
                .map(matchResult -> matchResult.group(1)) // 提取第一个捕获组，即用户名
                .collect(Collectors.toSet());

        return usernames;
    }
}