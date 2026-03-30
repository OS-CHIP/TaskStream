package com.example.demo.api.tb.domain.enums;

/**
 * 审批状态枚举
 */
public enum ApprovalStatus {

    PENDING(100, "待审批"),
    APPROVED(101, "同意"),
    REJECTED(102, "拒绝");

    private final int code;
    private final String desc;

    ApprovalStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }

    /**
     * 根据 code 获取对应的枚举（用于数据库反序列化）
     */
    public static ApprovalStatus fromCode(int code) {
        for (ApprovalStatus status : values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("无效的审批状态 code: " + code);
    }

    /**
     * 判断是否是终态（已处理）
     */
    public boolean isFinal() {
        return this == APPROVED || this == REJECTED;
    }

    @Override
    public String toString() {
        return this.name();
    }
}