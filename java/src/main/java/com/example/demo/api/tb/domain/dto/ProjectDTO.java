package com.example.demo.api.tb.domain.dto;


import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;


@Data
public class ProjectDTO {

    /**
     * 项目id
     */
    private Long id;

    /**
     * 项目名称
     */
    private String projectName;

    /**
     * 项目状态
     */
    private String status;

    /**
     * 项目描述
     */
    private String description;

    /**
     *  父项目id
     */

    private Long parentId;

    /**
     *  拥有者
     */
    private Long owner;

    private String picAddr;


}
