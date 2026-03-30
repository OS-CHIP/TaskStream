package com.example.demo.api.tb.domain.vo;


import com.example.demo.api.tb.domain.Attachment;
import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Data
public class TaskVO {

    private Long id;
    private String taskTitle;
    private String taskCode;
    private Integer taskTypeId;
    private String tags;
    private Integer projectId;
    private String description;
    private String priority;
    private String assigner;
    /**
     * 任务参与者列表
     * 存储有只读权限的用户ID，多个ID用英文逗号分隔，例如 "1001,1002,1003"
     */
    private String observers;
    private String completionPercentage;
//    private Integer parentId;
    private String assignee;
    private BigDecimal estimatedHours;
    private String status;
    private Date startTime;
    private Date dueDate;
    private Date createTime;
    private String createBy;
    private Date updateTime;
    private String updateBy;
    private Integer isDeleted;
//    private Integer level; // 递归查询中计算出来的层级：0, 1, 2...
//    private String path;
    // 附件信息
    private List<AttachmentVO> attachments;
    // 动态字段信息
    private String dynamicFields;
    // 任务类型名称
    private String taskTypeName;

}
