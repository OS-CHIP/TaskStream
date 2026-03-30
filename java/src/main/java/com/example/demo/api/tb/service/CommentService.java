package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.Comment;
import com.example.demo.api.tb.domain.dto.CommentCreateDTO;
import com.example.demo.api.tb.domain.vo.CommentVO;

import java.util.List;

/**
* @author ji156
* @description 针对表【comment】的数据库操作Service
* @createDate 2025-02-10 17:00:07
*/
public interface CommentService extends IService<Comment> {


    boolean publishComment(CommentCreateDTO dto);


    List<Comment> getCommentsByTaskId(Long taskId);

    List<CommentVO> getCommentTree(Long taskId);

}
