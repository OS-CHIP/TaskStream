package com.example.demo.api.tb.domain.vo.Dashboard;

import lombok.Data;

import java.util.List;

@Data
public class Trend {
    private String date;  // 日期，如 "2025-04-16"
    private Integer count; // 该日创建的任务数
}