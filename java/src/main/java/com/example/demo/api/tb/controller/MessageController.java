package com.example.demo.api.tb.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.domain.dto.MarkReadDTO;
import com.example.demo.api.tb.domain.dto.SystemNoticeSendDTO;
import com.example.demo.api.tb.domain.dto.UnreadCountDTO;
import com.example.demo.api.tb.service.MessageService;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

@RestController
@RequestMapping("notice")
public class MessageController {

    @Resource
    private MessageService messageService;
//    @Resource
//    private EventRemindService eventRemindService;

    /**
     * 发送系统通知
     *
     * @param dto
     * @return
     */
    @NotForSuperAdmin
    @PostMapping("/send")
    public SaResult sendNotice(@RequestBody SystemNoticeSendDTO dto) {
        messageService.publishNotice(dto);
        return SaResult.ok("通知发送成功");
    }

    /**
     * 分页查询当前用户的通知（支持按已读/未读筛选）
     * @param page
     * @param size
     * @param isRead
     * @return
     */

    @GetMapping("/list")
    public SaResult listNotices(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean isRead
    ) {
        Long userId = StpUtil.getLoginIdAsLong();
        var result = messageService.queryNoticeList(userId, isRead, page, size);
        return SaResult.ok().setData(result);
    }

    /**
     * 用户点击某条通知后标记为已读
     * type   1=系统通知, 2=事件提醒
     * id 对应记录的主键ID
     *
     * @return
     */
    @PostMapping("/markRead")
    public SaResult markRead(@RequestBody MarkReadDTO dto) {
        Long userId = StpUtil.getLoginIdAsLong(); // Sa-Token 获取当前用户
        messageService.markAsRead(userId, dto.getType(), dto.getId());
        return SaResult.ok("已标记为已读");
    }


    /**
     * 一键清空未读”（即标记全部通知为已读）
     *
     * @return
     */
    @GetMapping("markAllRead")
    public SaResult markAllRead() {
        Long userId = StpUtil.getLoginIdAsLong(); // Sa-Token 获取当前用户
        messageService.markAllAsRead(userId);
        return SaResult.ok("所有未读通知已清空");
    }

    /**
     * 获取未读数量    用于红点提示（如顶部消息图标）
     *
     * @return
     */
    @GetMapping("/unreadCount")
    public SaResult getUnreadCount() {
        Long userId = StpUtil.getLoginIdAsLong(); // Sa-Token 获取当前用户
        UnreadCountDTO count = messageService.getUnreadCount(userId);
        return SaResult.ok("未读数量获取成功").setData(count);
    }

//    /**
//     * 创建事件提醒
//     *
//     * @return
//     */
//    @GetMapping("/createRemind")
//    public SaResult createRemind(Long receiverId, String title, String content) {
//        eventRemindService.createRemind(receiverId, title, content);
//        return SaResult.ok("创建事件提醒");
//    }



}