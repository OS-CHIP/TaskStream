package com.example.demo.api.tb.domain.vo.Dashboard;

import lombok.Data;

import java.util.List;

@Data
public class DashboardData {
    private Stats stats;
    private List<Trend>  createTrend;
    private List<Trend> completeTrend;
    private List<WorkHours> workHours;
}