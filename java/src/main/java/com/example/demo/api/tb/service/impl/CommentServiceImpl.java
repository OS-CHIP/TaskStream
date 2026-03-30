package com.example.demo.api.tb.service.impl;


import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Comment;
import com.example.demo.api.tb.domain.MsgEventRemind;
import com.example.demo.api.tb.domain.SysUser;
import com.example.demo.api.tb.domain.Task;
import com.example.demo.api.tb.domain.dto.CommentCreateDTO;
import com.example.demo.api.tb.domain.vo.CommentVO;
import com.example.demo.api.tb.mapper.CommentMapper;
import com.example.demo.api.tb.service.CommentService;
import com.example.demo.api.tb.service.MessageService;
import com.example.demo.api.tb.service.SysUserService;
import com.example.demo.api.tb.service.TaskService;
import com.example.demo.api.tb.utils.tree.TreeBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * @author ji156
 * @description 针对表【comment】的数据库操作Service实现
 * @createDate 2025-02-10 17:00:07
 */
@Slf4j
@Service
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {
    @Resource
    private CommentMapper commentMapper;
    @Resource
    private MessageService messageService;
    @Resource
    private SysUserService userService;
    @Resource
    private TaskService taskService;
    // 用于解析 @用户名 的正则表达式
    private static final Pattern AT_PATTERN = Pattern.compile("@([a-zA-Z0-9_]+)");

    /**
     * 发布评论，并处理通知逻辑
     *
     * @param dto 评论创建 DTO
     * @return 是否成功
     */
    @Transactional // 建议加上事务，确保数据库操作和通知发送的一致性
    @Override
    public boolean publishComment(CommentCreateDTO dto) {
        Comment comment = new Comment();
        BeanUtil.copyProperties(dto, comment);

        // 1. 保存评论
        if (commentMapper.insert(comment) <= 0) {
            log.error("评论发布失败，数据库插入失败。DTO: {}", dto);
            return false;
        }

        long senderId = StpUtil.getLoginIdAsLong(); // 获取评论者ID
        Long commentId = comment.getId();
        Long taskId = comment.getTaskId(); // 被评论的任务ID
        Long parentId = comment.getParentId(); // 父评论ID，用于判断是直接评论还是回复

        String content = comment.getContent();

        // 2. 处理 @ 提及通知
        Set<String> mentionedUsernames = parseMentionedUsers(content);
        for (String username : mentionedUsernames) {

            SysUser sysUser = userService.getOne(new LambdaQueryWrapper<SysUser>().eq(SysUser::getUserName, username));
            if (sysUser == null) {
                log.warn("用户不存在: {}", username);
                continue;
            }
            Long mentionedUserId = sysUser.getId();
            if (mentionedUserId != null && !mentionedUserId.equals(senderId)) { // 确保被@的不是自己
                messageService.createRemind(
                        mentionedUserId, // 被@的用户ID
                        senderId,        // 评论者ID
                        5,               // event_type: 5 = @提及
                        3,               // target_type: 3 = 评论
                        commentId,       // target_id: 评论ID
                        content,         // summary: 评论内容
                        "/task/" + taskId + "#comment-" + commentId // jumpUrl: 跳转到任务页面并定位到评论
                );
                log.info("发送@提及通知: 评论者ID={}, 被@用户ID={}, 评论ID={}", senderId, mentionedUserId, commentId);
            }
        }

        // 3. 处理评论/回复通知
        if (parentId == null || parentId == 0) {
            // 3a. 直接评论任务/动态 -> 通知任务/动态创建者
            Task task = taskService.getOne(new LambdaQueryWrapper<Task>().eq(Task::getId, taskId));
            String assigner = task.getAssigner();

            if (assigner != null && !assigner.equals(String.valueOf(senderId))) { // 确保评论者不是任务创建者自己
                messageService.createRemind(
                        Long.parseLong(assigner),   // 任务创建者ID
                        senderId,        // 评论者ID
                        2,               // event_type: 2 = 评论
                        1,               // target_type: 1 = 任务 (或根据你的定义，可能是动态等)
                        taskId,          // target_id: 任务ID
                        content,         // summary: 评论内容
                        "/task/" + taskId + "#comment-" + commentId // jumpUrl: 跳转到任务页面并定位到评论
                );
                log.info("发送任务评论通知: 评论者ID={}, 任务负责人={}, 任务ID={}", senderId, assigner, taskId);
            }
        } else {
            // 3b. 回复评论 -> 通知被回复的评论的创建者
            // 需要查询被回复评论的创建者用户名
            Comment parentComment = commentMapper.selectOne(new LambdaQueryWrapper<Comment>().eq(Comment::getId, parentId));
            Long repliedUserId = parentComment.getCreateBy();

            if (repliedUserId != null && !repliedUserId.equals(senderId)) { // 确保不是自己回复自己
                messageService.createRemind(
                        repliedUserId,   // 被回复的评论的创建者ID
                        senderId,        // 回复者ID
                        2,               // event_type: 2 = 评论 (这里也可以定义为 '回复', 但通常复用 '评论' 类型)
                        3,               // target_type: 3 = 评论
                        parentId,        // target_id: 被回复的评论ID
                        content,         // summary: 回复内容
                        "/task/" + taskId + "#comment-" + commentId // jumpUrl: 跳转到任务页面并定位到回复评论
                );
                log.info("发送评论回复通知: 回复者ID={}, 被回复者ID={}, 原评论ID={}, 回复评论ID={}", senderId, repliedUserId, parentId, commentId);
            }

            // 3c. (可选) 回复评论时，也通知任务/动态创建者 (根据业务需求决定)
            // Long taskCreatorId = taskService.getCreatorIdByTaskId(taskId);
            // if (taskCreatorId != null && !taskCreatorId.equals(senderId) && !taskCreatorId.equals(repliedUserId)) {
            //     // 避免重复通知（如果被回复者就是任务创建者）
            //     messageService.createRemind(taskCreatorId, senderId, 2, 1, taskId, content, "/task/" + taskId + "#comment-" + commentId);
            //     log.info("发送任务内回复通知给创建者: 评论者ID={}, 任务创建者ID={}, 任务ID={}", senderId, taskCreatorId, taskId);
            // }
        }

        log.info("评论发布成功，评论ID：{}", commentId);
        return true;
    }


    /**
     * 解析评论内容中的 @用户名
     *
     * @param content 评论内容
     * @return 被@的用户名集合
     */
    private Set<String> parseMentionedUsers(String content) {
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


    @Override
    public List<Comment> getCommentsByTaskId(Long taskId) {

        LambdaQueryWrapper<Comment> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(Comment::getTaskId, taskId);
        return commentMapper.selectList(queryWrapper);
    }


    @Override
    public List<CommentVO> getCommentTree(Long taskId) {
        // 查询所有评论（扁平结构）
        List<CommentVO> comments = commentMapper.getAllTasksWithLevel(taskId);

        // 使用通用工具类构建树，一行搞定！
        return TreeBuilder.buildTree(comments, CommentVO::getId, CommentVO::getParentId);

//        // 查询所有该任务下的评论
//        List<CommentVO> comments = commentMapper.getAllTasksWithLevel(taskId);
//        if (comments == null || comments.isEmpty()) {
//            return new ArrayList<>();
//        }
//        // 构建树形结构并返回
//        return buildCommentTree(comments);
    }

    /**
     * 将扁平化的评论列表转换为树形结构
     *
     * @param comments 扁平化的评论列表
     * @return 树形结构的评论列表
     */
    private List<CommentVO> buildCommentTree(List<CommentVO> comments) {
        // 使用 Map 快速查找节点
        Map<Long, CommentVO> nodeMap = new HashMap<>();
        for (CommentVO comment : comments) {
            nodeMap.put(comment.getId(), comment);
        }

        // 根据 path 字段排序，确保父节点总是在子节点之前处理
        comments.sort(Comparator.comparing(CommentVO::getPath));

        // 构建树形结构
        List<CommentVO> rootNodes = new ArrayList<>();
        for (CommentVO comment : comments) {
            if (comment.getLevel() == 0) { // level=0 的为根节点
                rootNodes.add(comment);
            } else {
                String path = comment.getPath();
                if (path == null || path.isEmpty()) {
                    continue; // 忽略无效路径
                }

                String[] pathParts = path.split(",");
                if (pathParts.length < 2) {
                    continue; // 至少需要一个父节点
                }
                try {
                    // 获取父节点 ID（倒数第二个元素）
                    Long parentId = Long.valueOf(pathParts[pathParts.length - 2]);
                    CommentVO parent = nodeMap.get(parentId);
                    if (parent != null) {
                        // 确保 children 不为 null
                        if (parent.getChildren() == null) {
                            parent.setChildren(new ArrayList<>());
                        }
                        parent.getChildren().add(comment);
                    }
                } catch (NumberFormatException e) {
                    // 忽略非法 parentId
                    continue;
                }
            }
        }

        return rootNodes;
    }


}




