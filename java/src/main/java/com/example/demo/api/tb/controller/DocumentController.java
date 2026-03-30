package com.example.demo.api.tb.controller;


import cn.dev33.satoken.util.SaResult;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.domain.Document;
import com.example.demo.api.tb.domain.dto.DocumentCreateDTO;
import com.example.demo.api.tb.domain.dto.DocumentUpdateDTO;
import com.example.demo.api.tb.domain.vo.DocumentVO;
import com.example.demo.api.tb.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import javax.validation.constraints.*;

/**
 * 文档控制器
 */
@RestController
@RequestMapping("document")
@RequiredArgsConstructor
@Validated
@Slf4j
public class DocumentController {

    @Resource
    private DocumentService documentService;

    /**
     * 创建新文档
     *
     * <p>要求用户已登录（Sa-Token 自动校验）</p>
     *
     * @param dto 文档创建参数
     * @return 文档ID
     */
    @NotForSuperAdmin
    @PostMapping("saveDocument")
    public SaResult createDocument(@Valid @RequestBody DocumentCreateDTO dto) {
        Long docId = documentService.createDocument(dto);
        return SaResult.ok().set("id", docId);
    }

    /**
     * 删除文档（逻辑删除）
     */
    @NotForSuperAdmin
    @GetMapping("deleteDocument/{id}")
    public SaResult deleteDocument(@PathVariable Long id) {
        // 参数校验
        if (id == null || id <= 0) {
            return SaResult.error("文档ID无效");
        }
        try {


            documentService.deleteDocument(id);
            return SaResult.ok("删除成功");
        } catch (Exception e) {
            // 异常处理和日志记录
            log.error("删除文档失败，文档ID: {}", id, e);
            return SaResult.error("删除失败：" + e.getMessage());
        }
    }

    /**
     * 分页查询
     */
    @PostMapping("/queryDocumentPage")
    public SaResult queryDocumentPage(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String  keyword,
            @RequestParam @NotBlank(message = "项目ID不能为空") @Min(value = 1, message = "项目ID必须大于0") String projectId,
            @RequestParam(defaultValue = "1") @Min(value = 1, message = "页码必须大于0") Integer pageNum,
            @RequestParam(defaultValue = "10") @Min(value = 1, message = "页面大小必须大于0") @Max(value = 100, message = "页面大小不能超过100") Integer pageSize) {
            IPage<Document> taskPage = documentService.queryDocumentPage(status, Long.valueOf(projectId),keyword, pageNum, pageSize);
            return SaResult.ok("查询成功").setData(taskPage);
    }

    /**
     * 获取文档详情（含附件列表）
     *
     * @param documentId 文档ID
     * @return 文档详情
     */
    @GetMapping("getDocument/{documentId}")
    public SaResult getDocument(@PathVariable Long documentId) {
        DocumentVO documentVO = documentService.getDocument(documentId);
        return SaResult.ok("查询成功").setData(documentVO);
    }

    /**
     * 更新文档基本信息
     * @param dto  更新数据
     * @return 更新后的文档信息
     */
    @NotForSuperAdmin
    @PostMapping("/updateDocument")
    public SaResult updateDocument(
            @Valid @RequestBody DocumentUpdateDTO dto) {
        documentService.updateDocument(dto);
        return SaResult.ok( "更新成功");
    }


}