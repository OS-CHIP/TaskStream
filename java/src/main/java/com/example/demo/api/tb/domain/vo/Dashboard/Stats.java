package com.example.demo.api.tb.domain.vo.Dashboard;

import lombok.Data;

@Data
public class Stats {

    private Long totalProjects = 0L;        // 总项目数
    private Long pending= 0L;              // 待开始
    private Long inProgress= 0L;           // 进行中
    private Long completed= 0L;            // 已完成
    private Long canceled= 0L;             // 已取消
    private Long blocked= 0L;              // 已阻塞
    private Long overdue= 0L;                 //延期
}