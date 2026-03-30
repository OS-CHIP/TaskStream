package com.example.demo.api.tb.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.demo.api.tb.domain.Document;
import com.example.demo.api.tb.domain.vo.DocumentVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface DocumentMapper extends BaseMapper<Document> {
    IPage<DocumentVO> selectPageWithAttachment(@Param("page") Page<DocumentVO> page,@Param("status") String status,@Param("projectId") Long projectId,@Param("keyword") String keyword);
}