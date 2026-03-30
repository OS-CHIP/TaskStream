package com.example.demo.api.tb.domain.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * 创建子项目oa单
 */
@Data
public class CreateSubProjectOaDTO {


    //父项目id
    @NotNull(message = "父项目id不能为空")
    private Long projectParentId;

    /**
     *  项目名称
     */
    @NotBlank( message = "项目名称不能为空")
    private String projectName;

    //子项目id
    private Long projectSubId;

    /**
     * 描述
     */
    @NotBlank( message = "描述不能为空")
    private String description;

    /**
     * 项目描述
     */
    private String projectDescription;

    //开始时间
    @NotNull(message = "开始时间不能为空")

    private Date startTime;
    /**
     * 截止时间
     */
    @NotNull( message = "截止时间不能为空")
    private Date dueDate;

    //发起人
    private String initiator;

    //审批人
//    @NotBlank( message = "审批人不能为空")
    private String approver;

    // 优先级
    private String priority;

    private String status;


}