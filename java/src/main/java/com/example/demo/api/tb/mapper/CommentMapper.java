package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.Comment;
import com.example.demo.api.tb.domain.vo.CommentVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

/**
* @author ji156
* @description 针对表【comment】的数据库操作Mapper
* @createDate 2025-02-10 17:00:07
* @Entity com.example.demo.api.tb.domain.Comment
*/
@Mapper
public interface CommentMapper extends BaseMapper<Comment> {

    List<CommentVO> getAllTasksWithLevel(Long taskId);
}




