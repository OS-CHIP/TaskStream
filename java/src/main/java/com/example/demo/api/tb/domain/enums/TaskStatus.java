package com.example.demo.api.tb.domain.enums;


public enum TaskStatus {

    PENDING(1, "待开始"),
    IN_PROGRESS(2, "进行中"),
    COMPLETED(3, "已完成"),
    CANCELLED(4, "已取消"),
    BLOCKED(5, "已阻塞"),
    PENDING_REVIEW(6, "带审查"),;

    private final int code;
    private final String desc;

    TaskStatus(int code, String desc) {
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
     * 根据 code 获取对应的枚举
     */
    public static TaskStatus fromCode(int code) {
        for (TaskStatus status : TaskStatus.values()) {
            if (status.code == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("无效的任务状态 code: " + code);
    }

    /**
     * 是否是终态（已完成、已取消、已阻塞）
     */
    public boolean isFinalStatus() {
        return this == COMPLETED || this == CANCELLED || this == BLOCKED;
    }

    @Override
    public String toString() {
        return this.name();
    }
}
