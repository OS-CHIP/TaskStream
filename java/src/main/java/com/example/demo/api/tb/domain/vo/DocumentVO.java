package com.example.demo.api.tb.domain.vo;



import lombok.Data;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.Date;


@Data
public class DocumentVO {
    private Long id;
    private Long projectId;
    private String title;
    private String description;
    private String content;
    private String documentType;
    private String status;
    private Long createBy;
    private Date createTime;
    private Date updateTime;

    private ArrayList<AttachmentVO> attachment;
}