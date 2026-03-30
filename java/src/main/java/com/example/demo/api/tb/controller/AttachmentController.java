package com.example.demo.api.tb.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.domain.vo.AttachmentVO;
import com.example.demo.api.tb.service.AttachmentService;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import io.minio.http.Method;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import javax.annotation.Resource;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;


@RestController
@RequestMapping("attachment")
@Slf4j
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @Value("${minio-prefix}")
    private String minioPrefix;
    @Value("${minio.bucket}")
    private String bucket;

    /**
     *  批量上传文件
     * @param files
     * @param sourceType
     * @return
     * @throws Exception
     */
    @NotForSuperAdmin
    @PostMapping("uploadBatch")
    public SaResult uploadBatch(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("sourceType") String sourceType){

        if (files == null || files.isEmpty()) {
            return SaResult.error("未选择任何文件");
        }

        // 校验 sourceType
        if (!Arrays.asList("task","document", "comment", "project").contains(sourceType)) {
            return SaResult.error("无效的 sourceType");
        }
        try {
            List<Attachment> attachments = attachmentService.uploadAttachments(files, sourceType);



            List<AttachmentVO> collect = attachments.stream()
                    .map(attachment -> {
                        AttachmentVO vo = new AttachmentVO();
                        vo.setId(attachment.getId());
                        vo.setUrl(minioPrefix + "/" + bucket + "/" + attachment.getFilePath());
                        vo.setFileName(attachment.getFileName());
                        vo.setFileSize(attachment.getFileSize());
                        vo.setMimeType(attachment.getMimeType());
                        return vo;
                    }).toList();

            log.info("上传成功: {}", collect);
            return SaResult.ok( "上传成功").setData(collect);
        } catch (Exception e) {
            log.error("批量上传失败", e);
            return SaResult.error("上传失败: " + e.getMessage());
        }
    }

    public static void main(String[] args) throws Exception {
        MinioClient minioClient = MinioClient.builder()
                .endpoint("http://localhost:9090")        // MinIO 地址
                .credentials("admin", "minioadmin") // 替换为你的密钥
                .build();

        // 生成 GET 预签名 URL（1小时有效）
        String url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket("attachments-tb") // 桶名
                        .object("task/202510/1990967be0554b8e9692a4af187f6642.png") // 对象路径
                        .expiry(3600) // 过期时间（秒），最大 7 天（604800）
                        .build()
        );

        System.out.println("预签名 URL: " + url);
        // 输出示例：
        // http://localhost:9000/task/202510/874d6e12a6564ae8b0aa732067acc3b9.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&...
    }

    /**
     * 删除附件
     */
    @NotForSuperAdmin
    @GetMapping("deleteAttachment/{attachmentId}")
    public SaResult deleteAttachment(@PathVariable Long attachmentId) {
        if (attachmentId == null || attachmentId <= 0) {
            return SaResult.error("附件ID无效");
        }
//        String currentUserId = StpUtil.getLoginIdAsString();
//        Attachment existing = attachmentService.getById(attachmentId);
//        // 2. 权限校验：创建者 或 管理员
//        boolean isAdmin = StpUtil.hasRole("admin");
//        if (!existing.getCreateBy().toString().equals(currentUserId) && !isAdmin) {
//            throw new RuntimeException("无权修改他人文档");
//        }
        attachmentService.removeById(attachmentId);
        return SaResult.ok("删除成功");
    }

//
//    @Resource
//    private MinioClient minioClient;
//
//    /**
//     * 生成文件下载的预签名 URL
//     * @param objectName 对象路径，如 "task/202510/xxx.png"
//     * @return 预签名 URL（有效期默认 30 分钟）
//     */
//    @GetMapping("/generateDownloadUrl")
//    @SaIgnore
//    public SaResult generateDownloadUrl(@RequestParam String objectName) {
//        if (objectName == null || objectName.isBlank()) {
//            return SaResult.error("objectName不能为空");
//        }
//
//        try {
//            String url = minioClient.getPresignedObjectUrl(
//                    GetPresignedObjectUrlArgs.builder()
//                            .method(Method.GET)
//                            .bucket(bucket)
//                            .object(objectName)
//                            .expiry(1800) // 30分钟
//                            .build()
//            );
//            return SaResult.ok("下载URL").setData(url);
//        } catch (Exception e) {
//            log.error("生成下载URL失败: {}", objectName, e);
//            return SaResult.error().setMsg("生成下载URL失败");
//        }
//    }
//
//
//    @GetMapping("/download")
//    @SaIgnore
//    public void downloadFile(
//            @RequestParam String objectName,
//            @RequestParam(required = false) String fileName,
//            HttpServletResponse response) throws IOException {
//
//        if (objectName == null || objectName.isBlank()) {
//            response.sendError(HttpServletResponse.SC_BAD_REQUEST, "objectName is required");
//            return;
//        }
//
//        try (InputStream inputStream = minioClient.getObject(
//                GetObjectArgs.builder()
//                        .bucket(bucket)
//                        .object(objectName)
//                        .build())) {
//
//            // 设置响应头
//            String downloadName = Objects.requireNonNullElse(fileName, extractFileName(objectName));
//            response.setContentType("application/octet-stream");
//            response.setHeader("Content-Disposition",
//                    "attachment; filename=\"" + URLEncoder.encode(downloadName, "UTF-8") + "\"");
//
//            // 流式写入响应
//            StreamUtils.copy(inputStream, response.getOutputStream());
//            response.flushBuffer();
//
//        } catch (ErrorResponseException e) {
//            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "MinIO错误");
//        } catch (Exception e) {
//            log.error("下载文件失败: {}", objectName, e);
//            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "服务器错误");
//        }
//    }
//
//    // 工具方法：从路径提取文件名
//    private String extractFileName(String path) {
//        return path.substring(path.lastIndexOf('/') + 1);
//    }

}