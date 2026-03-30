package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.domain.Comment;
import com.example.demo.api.tb.domain.vo.CommentVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;


@Mapper
public interface AttachmentMapper extends BaseMapper<Attachment> {


}




