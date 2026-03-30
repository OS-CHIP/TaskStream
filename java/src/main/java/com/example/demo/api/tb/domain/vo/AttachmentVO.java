package com.example.demo.api.tb.domain.vo;

import lombok.Data;

@Data
public class AttachmentVO {
    private Long id;
    private String url;
    private String fileName;
    private Long fileSize;
    private String mimeType;
}
