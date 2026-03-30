package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;
import cn.hutool.crypto.digest.BCrypt;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.domain.Comment;
import com.example.demo.api.tb.domain.dto.CommentCreateDTO;
import com.example.demo.api.tb.domain.vo.CommentVO;
import com.example.demo.api.tb.service.CommentService;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * (Comment)表控制层
 *
 * @author makejava
 * @since 2025-02-10 16:15:15
 */

@Slf4j
@RestController
@RequestMapping("comment")
public class CommentController {

    @Resource
    private CommentService commentService;


    /**
     * 发布评论
     *
     * @param dto 评论内容对象
     * @return 返回发布结果，成功返回true，失败返回false
     */
    @NotForSuperAdmin
    @PostMapping("/publish")  // 处理HTTP POST请求，映射到"/publish"路径
    public SaResult publishComment(@RequestBody CommentCreateDTO dto) {  // 定义发布评论的方法，接收评论内容作为参数
        // 参数校验
        if (dto == null) {
            return SaResult.error("评论内容不能为空");
        }
        log.info("收到评论内容，评论ID：{}", dto.getId());
        try {
            // 调用commentService的publishComment方法处理评论发布逻辑
            boolean success = commentService.publishComment(dto);
            if (success) {
                return SaResult.ok();
            }
            return SaResult.error("评论发布失败");
        } catch (Exception e) {
            // 异常处理
            log.error("评论发布异常，评论ID：{}", dto.getId(), e);
            return SaResult.error("评论发布异常：" + e.getMessage());
        }
    }


    /**
     * 获取任务的评论列表
     *
     * @param taskId 任务ID
     * @return 评论列表
     */
    @GetMapping("/getCommentsByTaskId/{taskId}")
    public SaResult getCommentsByTaskId(@PathVariable Long taskId) {
        // 参数校验
        if (taskId == null || taskId <= 0) {
            return SaResult.error("任务ID不合法");
        }
        try {
            List<Comment> commentList = commentService.getCommentsByTaskId(taskId);
            return SaResult.ok().setData(commentList);
        } catch (Exception e) {
            // 异常处理
            // 记录日志，便于问题追踪
            log.error("获取评论列表异常，任务ID: {}", taskId, e);
            return SaResult.error("获取评论列表异常");
        }
    }

    /**
     * 获取任务的评论树
     * @param taskId 任务ID
     * @return 评论树
     */
    @GetMapping("/getCommentTree/{taskId}")
    public SaResult getCommentTree(@PathVariable Long taskId) {
        // 参数校验
        if (taskId == null || taskId <= 0) {
            log.warn("非法的任务ID: {}", taskId);
            return SaResult.error("任务ID不合法");
        }

        try {
            log.info("开始获取任务 {} 的评论树", taskId);
            List<CommentVO> result = commentService.getCommentTree(taskId);
            log.info("成功获取任务 {} 的评论树，共 {} 条记录", taskId,
                     result != null ? result.size() : 0);
            return SaResult.ok().setData(result);
        } catch (Exception e) {
            log.error("获取任务 {} 的评论树时发生异常", taskId, e);
            return SaResult.error("获取评论树失败: " + e.getMessage());
        }
    }
}



