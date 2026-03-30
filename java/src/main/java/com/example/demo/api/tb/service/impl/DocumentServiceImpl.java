package com.example.demo.api.tb.service.impl;


import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.constant.ProjectConstants;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.domain.Document;
import com.example.demo.api.tb.domain.dto.DocumentCreateDTO;
import com.example.demo.api.tb.domain.dto.DocumentUpdateDTO;
import com.example.demo.api.tb.domain.vo.AttachmentVO;
import com.example.demo.api.tb.domain.vo.DocumentVO;
import com.example.demo.api.tb.mapper.AttachmentMapper;
import com.example.demo.api.tb.mapper.DocumentMapper;
import com.example.demo.api.tb.service.AttachmentService;
import com.example.demo.api.tb.service.DocumentService;
import com.example.demo.api.tb.utils.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;


/**
 * @author ji156
 * @description 针对表【comment】的数据库操作Service实现
 * @createDate 2025-02-10 17:00:07
 */
@Service
@Transactional
@Slf4j
public class DocumentServiceImpl extends ServiceImpl<DocumentMapper, Document> implements DocumentService {




    @Resource
    private AttachmentService attachmentService; // 需要定义该 Mapper

    @Resource
    private DocumentMapper documentMapper; // 需要定义该 Mapper

    @Value("${minio-prefix}")
    private String minioPrefix;
    @Value("${minio.bucket}")
    private String bucket;

    /**
     * 创建文档（含附件绑定）
     *
     * @param dto 创建文档的请求数据
     * @return 新创建的文档 ID
     */
    @Transactional(rollbackFor = Exception.class)
    public Long createDocument(DocumentCreateDTO dto) {
        // 1. 获取当前登录用户ID（Sa-Token）
        Long userId = StpUtil.getLoginIdAsLong();


        // 2. 构建文档实体
        Document doc = new Document();
        BeanUtil.copyProperties(dto, doc);

        // 3. 保存文档到数据库
        this.save(doc);
        Long docId = doc.getId();

        // 4. 如果有附件 ID 列表，则更新这些附件的 source_type 和 source_id
        if (dto.getAttachmentIds() != null && !dto.getAttachmentIds().isEmpty()) {
            // 安全校验：确保这些附件属于当前用户，且未被绑定
            for (Long attId : dto.getAttachmentIds()) {
                Attachment att = attachmentService.getById(attId);
                if (att == null) {
                    throw new RuntimeException("附件不存在");
                }
                if (!"document".equals(att.getSourceType())) {
                    throw new RuntimeException("附件不存在或已被使用");
                }
                if (!userId.equals(att.getCreateBy())) {
                    throw new RuntimeException("无权绑定他人上传的附件");
                }

                // 更新附件关联
                LambdaUpdateWrapper<Attachment> updateWrapper = new LambdaUpdateWrapper<>();

                updateWrapper.eq(Attachment::getId, attId)
                        .eq(Attachment::getCreateBy, userId)
                        .set(Attachment::getSourceType, "document")
                        .set(Attachment::getSourceId, docId);
                attachmentService.update(null, updateWrapper);
            }
        }

        return docId;
    }


    /**
     * 逻辑删除文档（仅创建者或管理员可删）
     *
     * @param documentId 文档ID
     * @throws RuntimeException 权限不足或文档不存在
     */
    public void deleteDocument(Long documentId) {
        // 1. 获取当前登录用户ID
        String currentUserId = StpUtil.getLoginIdAsString();

        // 2. 查询文档（自动排除 is_deleted = 1 的记录）
        Document doc = this.getById(documentId);
        if (doc == null) {
            throw new RuntimeException("文档不存在或已被删除");
        }

        // 3. 权限校验：必须是创建者 或 管理员（假设管理员角色为 "admin"）
        boolean isAdmin = StpUtil.hasRole("admin");
        if (!doc.getCreateBy().toString().equals(currentUserId) && !isAdmin) {
            throw new RuntimeException("无权删除他人文档");
        }

        // 4. 执行逻辑删除（MyBatis-Plus 自动将 is_deleted 设为 1）
        boolean success = this.removeById(documentId);
        if (!success) {
            throw new RuntimeException("删除失败");
        }
    }

    @Override
    public IPage<Document> queryDocumentPage(String status, Long projectId, String keyword, Integer pageNum, Integer pageSize) {
        Page<Document> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<Document> wrapper = new LambdaQueryWrapper<>();

        // 1. 权限控制：非超级管理员必须限定项目
        String loginId = StpUtil.getLoginIdAsString();
        boolean isSuperAdmin = StpUtil.hasRole(loginId, ProjectConstants.SUPER_ADMIN_ROLE_KEY);
        if (!isSuperAdmin) {
            wrapper.eq(Document::getProjectId, projectId);
        }

        // 2. 状态过滤（如果 status 有效）
        if (StringUtils.isNotBlank(status)) {
            wrapper.eq(Document::getStatus, status);
        }

        // 3. 关键词搜索（避免空 keyword 导致 LIKE '%%' 全表扫描）
        if (StringUtils.isNotBlank(keyword)) {
            wrapper.and(w -> w
                    .like(Document::getTitle, keyword)
                    .or().like(Document::getDescription, keyword)
                    .or().like(Document::getContent, keyword)
            );
        }

        // 4. 公共条件：未删除 + 按创建时间倒序
        wrapper.eq(Document::getIsDeleted, 0)
                .orderByDesc(Document::getCreateTime);

        return documentMapper.selectPage(page, wrapper);
    }

    /**
     * 获取文档详情（含附件列表）
     *
     * @param documentId 文档ID
     * @return 文档详情
     */
    @Override
    public DocumentVO getDocument(Long documentId) {

        // 1. 查询文档
        Document doc = documentMapper.selectById(documentId);
        if (doc == null) {
            throw new RuntimeException("文档不存在或已被删除");
        }
        LambdaQueryWrapper<Attachment> documentQueryWrapper = new LambdaQueryWrapper<Attachment>()
                .eq(Attachment::getSourceId, documentId)
                .eq(Attachment::getSourceType, "document")
                .eq(Attachment::getIsDeleted, 0)
                .select(Attachment::getId, Attachment::getFileName, Attachment::getFilePath, Attachment::getFileSize, Attachment::getMimeType);
        // 2. 查询附件
        List<Attachment> attachments = attachmentService.list(documentQueryWrapper);

        ArrayList<AttachmentVO> attachmentVOS = new ArrayList<>();
        attachments.forEach(attachment -> {
            AttachmentVO attachmentVO = new AttachmentVO();
            BeanUtils.copyProperties(attachment, attachmentVO);
            attachmentVO.setUrl(minioPrefix + "/" + bucket + "/" + attachment.getFilePath());
            attachmentVOS.add(attachmentVO);
        });
        // 3. 组装 VO
        DocumentVO vo = new DocumentVO();

        BeanUtils.copyProperties(doc, vo);
        vo.setAttachment(attachmentVOS);

        return vo;
    }


    /**
     * 更新文档基本信息（不含 content）
     */
    @Transactional
    public void updateDocument(DocumentUpdateDTO dto) {
        String currentUserId = StpUtil.getLoginIdAsString();

        // 1. 查询原文档（确保存在且未删除）
        Long documentId = dto.getId();
        Document existing = this.getById(dto.getId());
        if (existing == null) {
            throw new RuntimeException("文档不存在或已被删除");
        }

        // 2. 权限校验：创建者 或 管理员
        boolean isAdmin = StpUtil.hasRole("admin");
        if (!existing.getCreateBy().toString().equals(currentUserId) && !isAdmin) {
            throw new RuntimeException("无权修改他人文档");
        }

        // 3. 构建更新对象（避免覆盖未传字段）
        Document updateDoc = new Document();
        BeanUtils.copyProperties(dto, updateDoc);
        boolean updated = this.updateById(updateDoc);
        if (!updated) {
            throw new RuntimeException("文档更新失败");
        }
        // 4. 同步附件关系（整体替换）
        attachmentService.updateAttachments(documentId,dto.getAttachmentIds() ,"document");

    }

}







