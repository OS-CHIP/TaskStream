package com.example.demo.api.tb.domain;
import com.baomidou.mybatisplus.annotation.*;

import java.io.Serializable;
import java.util.Date;
import java.util.Random;

import com.example.demo.api.tb.utils.InviteCodeUtil;
import com.example.demo.api.tb.utils.SnowflakeUtil;
import lombok.Data;

/**
 * 
 * @TableName project
 */
@TableName(value ="project")
@Data
public class Project extends BaseEntity implements Serializable {


    /**
     * 
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;


    /**
     *  父项目id
     */

    @TableField(value = "parent_id")
    private Long parentId;


    /**
     *  拥有者
     */

    @TableField(value = "owner")
    private Long owner;


    /**
     *  项目名称
     */

    @TableField(value = "project_name")
    private String projectName;

    /**
     *  图片地址
     */
    @TableField(value = "pic_addr")
    private String picAddr;

    @TableField(value = "status")
    private String status;
    /**
     * 描述
     */
    @TableField(value = "description")
    private String description;

    /**
     * 邀请码
     */
    @TableField(value = "invite_code")
    private String inviteCode;


    /**
     * 逻辑删除 默认是 0
     */
    @TableLogic
    private Integer isDeleted;

//    // 生成邀请码 需要字母跟数字一起
//    private String generateInviteCode() {
//        Random random = new Random();
//        StringBuilder inviteCode = new StringBuilder();
//        for (int i = 0; i < 6; i++) {
//            if (random.nextBoolean()) {
//                inviteCode.append((char) (random.nextInt(26) + 'a'));
//            } else {
//                inviteCode.append(random.nextInt(10));
//            }
//        }
//        return inviteCode.toString();
//    }
//
//    public String getInviteCode() {
//        if (inviteCode == null) {
//            inviteCode = generateInviteCode();
//        }
//        return inviteCode;
//    }
    // ==================== 唯一邀请码生成逻辑 ====================
// ==================== 雪花算法生成邀请码 ====================

    /**
     * 使用雪花算法生成唯一邀请码（6位随机截取或转换）
     * @return 6～10位数字字符串（可选：加前缀）
     */
    public String generateInviteCode() {
        // 1. 生成雪花算法 ID（Long）
        long snowflakeId = SnowflakeUtil.nextId();

        // 2. 转为字符串，取后 6～10 位（避免过长）
        String raw = String.valueOf(snowflakeId);
        int len = raw.length();
        int start = Math.max(0, len - 10); // 最多取最后10位
        int end = Math.min(len, start + 8); // 最少取8位

        return raw.substring(start, end);
    }

//    /**
//     * 获取邀请码（若为空则自动生成）
//     */
//    public String getInviteCode() {
//        if (inviteCode == null || inviteCode.trim().isEmpty()) {
//            this.inviteCode = generateInviteCode();
//        }
//        return inviteCode;
//    }


    // ==================== Base62 邀请码生成 ====================

    /**
     * 获取邀请码（若为空则自动生成）
     */
    public String getInviteCode() {
        if (inviteCode == null || inviteCode.trim().isEmpty()) {
            this.inviteCode = InviteCodeUtil.generateInviteCode(8); // 8位
        }
        return inviteCode;
    }


    @TableField(exist = false)
    private static final long serialVersionUID = 1L;
}