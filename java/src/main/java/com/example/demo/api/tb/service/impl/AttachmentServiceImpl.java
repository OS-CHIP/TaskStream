package com.example.demo.api.tb.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.mapper.AttachmentMapper;
import com.example.demo.api.tb.service.AttachmentService;
import io.minio.*;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * @author ji156
 * @description 针对表【comment】的数据库操作Service实现
 * @createDate 2025-02-10 17:00:07
 */
@Service
@Transactional
@Slf4j
public class AttachmentServiceImpl extends ServiceImpl<AttachmentMapper, Attachment> implements AttachmentService {

    @Resource
    private MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucketName;

    @Resource
    private AttachmentMapper attachmentMapper;

    /**
     * 批量上传附件，部分成功也返回成功列表（可按需改为全成功或全失败）
     */
    public List<Attachment> uploadAttachments(List<MultipartFile> files, String sourceType) throws Exception {
        // 确保桶存在
        ensureBucketExists();

        List<Attachment> savedAttachments = new ArrayList<>();
        List<String> uploadedObjectNames = new ArrayList<>(); // 用于回滚

        try {
            for (MultipartFile file : files) {
//                if (file.isEmpty()) continue;

                // 校验文件（可选）
                validateFile(file);

                // 生成对象名
                String objectName = generateObjectName(sourceType, file.getOriginalFilename());

                // 上传到 MinIO
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectName)
                        .stream(file.getInputStream(), file.getSize(), -1)
                        .contentType(file.getContentType())
                        .build());

                // 2. 生成预签名下载 URL（有效期 30 分钟）
//                String downloadUrl = minioClient.getPresignedObjectUrl(
//                        GetPresignedObjectUrlArgs.builder()
//                                .method(Method.GET)
//                                .bucket(bucketName)
//                                .object(objectName)
//                                .expiry(0)
////                                .expiry(1800) // 30分钟
//                                .build()
//                );
//                System.out.println("Download URL: " + downloadUrl);
                // 保存 DB 记录
                Attachment attachment = new Attachment();
                attachment.setSourceType(sourceType);
                attachment.setFileName(file.getOriginalFilename());
                attachment.setFilePath(objectName);
                attachment.setFileSize( file.getSize());
                attachment.setMimeType(file.getContentType());


                attachmentMapper.insert(attachment);
                savedAttachments.add(attachment);
                uploadedObjectNames.add(objectName); // 记录已上传的 key，用于异常回滚
            }

            return savedAttachments;

        } catch (Exception e) {
            // 可选：回滚已上传的文件（谨慎使用，可能不完全可靠）
            rollbackUploadedFiles(uploadedObjectNames);
            throw e;
        }
    }

    @Override
    public void updateAttachments(Long sourceId, List<Long> newAttachmentIds , String sourceType) {

        // 1. 获取当前已绑定的附件ID（source_type='task' 且 source_id=taskId）
        List<Long> oldAttachmentIds = attachmentMapper.selectList(new LambdaUpdateWrapper<Attachment>()
                .eq(Attachment::getSourceType, sourceType)
                .eq(Attachment::getSourceId, sourceId)
                .eq(Attachment::getIsDeleted, "0")).stream().map(Attachment::getId).toList();


        // 2. 转为 Set 便于计算差集
        Set<Long> oldSet = new HashSet<>(oldAttachmentIds);
        Set<Long> newSet = new HashSet<>(newAttachmentIds);

        // 3. 计算要删除的：old - new
        Set<Long> toRemove = new HashSet<>(oldSet);
        toRemove.removeAll(newSet);

        // 4. 计算要新增的：new - old
        Set<Long> toAdd = new HashSet<>(newSet);
        toAdd.removeAll(oldSet);

        // 5. 解绑不再需要的附件（设为 source_id=0 或 source_type='temp'）
        if (!toRemove.isEmpty()) {
            this.unbindAttachments(toRemove);
        }

        // 6. 绑定新增的附件到当前任务
        if (!toAdd.isEmpty()) {
            this.bindAttachmentsToTask(sourceId, new ArrayList<>(toAdd), sourceType);
        }


    }


    // 解绑附件：设为未关联状态（例如 source_id=0, source_type='temp'）
    public void unbindAttachments(Collection<Long> ids) {
        if (ids == null || ids.isEmpty()) return;

        LambdaUpdateWrapper<Attachment> uw = new LambdaUpdateWrapper<>();
        uw.in(Attachment::getId, ids)
                .eq(Attachment::getIsDeleted, "0")
                // 可选：只允许解绑自己的附件
                // .eq(Attachment::getCreateBy, SaHolder.getLoginIdAsString())
                .set(Attachment::getSourceId, 0L)
                .set(Attachment::getSourceType, "temp");

        baseMapper.update(null, uw);
    }

    // 绑定附件到任务
    public void bindAttachmentsToTask(Long sourceId, List<Long> ids, String sourceType) {
        if (ids == null || ids.isEmpty()) return;

        LambdaUpdateWrapper<Attachment> uw = new LambdaUpdateWrapper<>();
        uw.in(Attachment::getId, ids)
                .eq(Attachment::getIsDeleted, "0")
//                .eq(Attachment::getSourceType, "temp") // 只允许绑定临时附件（安全）
                // .eq(Attachment::getCreateBy, SaHolder.getLoginIdAsString()) // 安全校验
                .set(Attachment::getSourceId, sourceId)
                .set(Attachment::getSourceType, sourceType);

        baseMapper.update(null, uw);
    }














    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
        if (!exists) {
            minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
        }
    }

    private void validateFile(MultipartFile file) {
        // 示例：限制文件大小 <= 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("文件大小不能超过 10MB: " + file.getOriginalFilename());
        }

        // 示例：限制类型（可根据业务调整）
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("文件类型未知");
        }

        // 定义支持的文件类型集合
        Set<String> supportedTypes = Set.of(
                // 图片类型
                "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp",
                // 文档类型
                "application/pdf", "text/plain", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/vnd.ms-powerpoint",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                // 压缩文件类型
                "application/zip", "application/x-rar-compressed",
                // 数据文件类型
                "application/json", "text/csv"
        );

//        if (!supportedTypes.contains(contentType)) {
//            throw new IllegalArgumentException("不支持的文件类型: " + contentType);
//        }
    }


    private String generateObjectName(String sourceType, String originalName) {
        String ext = "";
        if (originalName != null && originalName.lastIndexOf(".") > 0) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }
        String datePath = new SimpleDateFormat("yyyyMM").format(new Date());
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return String.format("%s/%s/%s%s", sourceType, datePath, uuid, ext);
    }

    /**
     * 回滚：删除已上传但 DB 未完全提交的文件（尽力而为）
     */
    private void rollbackUploadedFiles(List<String> objectNames) {
        for (String key : objectNames) {
            try {
                minioClient.removeObject(RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(key)
                        .build());
                log.warn("回滚删除 MinIO 文件: {}", key);
            } catch (Exception ex) {
                log.error("回滚删除失败: {}", key, ex);
            }
        }
    }

}







