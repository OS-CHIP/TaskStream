package com.example.demo.api.tb.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.Document;
import com.example.demo.api.tb.domain.dto.DocumentCreateDTO;
import com.example.demo.api.tb.domain.dto.DocumentUpdateDTO;
import com.example.demo.api.tb.domain.vo.DocumentVO;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.util.List;

public interface DocumentService extends IService<Document> {
    /**
     * 创建新文档
     *
     * @param dto 文档创建参数
     * @return 文档ID
     */
    Long createDocument(@Valid DocumentCreateDTO dto);

    void deleteDocument(Long id);

    IPage<Document> queryDocumentPage(String status, Long projectId, String keyword, Integer pageNum, Integer pageSize);

    DocumentVO getDocument(Long documentId);

    void updateDocument(DocumentUpdateDTO dto);
}
