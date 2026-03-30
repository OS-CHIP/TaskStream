package com.example.demo.api.tb.domain.vo;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data // Lombok 注解，自动生成 getter/setter 等
public class CommentVO implements Serializable {
    private Long id;           // 主键ID
    private Long taskId;       // 任务ID
    private Long parentId;     // 父评论ID
    private String content;    // 评论内容
    private Date createTime;   // 创建时间
    private Long createBy;     // 创建人
    private Integer level;     // 层级：0, 1, 2...
    private String path;       // 路径，如 "1,2,3"

    private List<CommentVO> children = new ArrayList<>(); // 默认初始化
}