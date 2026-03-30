package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.util.Date;

/**
 * 创建子项目oa单
 */
@Data
public class AgreeCreateSubProjectDTO {
    //taskid

    private Long taskId;
    //父项目id
    private Long projectParentId;

    //子项目id
    private Long projectSubId;

    /**
     *  项目名称
     */
    private String projectName;

    /**
     * 项目描述
     */
    private String projectDescription;

    //发起人
    private String owner;


    private String status;


}