package com.example.demo.api.tb.domain.vo;

import com.baomidou.mybatisplus.annotation.*;
 import com.example.demo.api.tb.utils.InviteCodeUtil;
import com.example.demo.api.tb.utils.SnowflakeUtil;
import lombok.Data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 
 * @TableName project
 */
@Data
public class ProjectVO  {

    private Long id;

    private Long parentId;

    private Long owner;

    private String ownerName;

    private String projectName;

    private String status;

    private String description;

    private String inviteCode;

    private Integer level;

    private String path;

    private List<ProjectVO> children = new ArrayList<>(); // 默认初始化
}