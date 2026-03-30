package com.example.demo.api.tb.utils;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.Objects;

/**
 * 日期时间工具类 - 支持生产环境使用
 */
public class DateUtils {

    // ==================== 常用格式化器 ====================
    public static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    // ==================== 1. String 转 Date ====================
    /**
     * 将字符串转换为 Date（yyyy-MM-dd 格式）
     */
    public static Date parseDate(String dateStr, String pattern) {
        if (dateStr == null || dateStr.trim().isEmpty()) return null;
        try {
            switch (pattern) {
                case "yyyy-MM-dd":
                    LocalDate localDate = LocalDate.parse(dateStr, DATE_FORMAT);
                    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
                case "yyyy-MM-dd HH:mm:ss":
                    LocalDateTime localDateTime = LocalDateTime.parse(dateStr, DATETIME_FORMAT);
                    return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
                default:
                    throw new IllegalArgumentException("Unsupported pattern: " + pattern);
            }
        } catch (Exception e) {
            System.err.println("Failed to parse date: " + dateStr + ", pattern: " + pattern + ", error: " + e.getMessage());
            return null;
        }
    }

    /**
     * 便捷方法：默认解析 yyyy-MM-dd
     */
    public static Date parseDate(String dateStr) {
        return parseDate(dateStr, "yyyy-MM-dd");
    }

    // ==================== 2. Date 转 String ====================
    /**
     * 将 Date 转为字符串（yyyy-MM-dd）
     */
    public static String formatDate(Date date) {
        if (date == null) return null;
        return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDate()
                .format(DATE_FORMAT);
    }

    /**
     * 将 Date 转为字符串（yyyy-MM-dd HH:mm:ss）
     */
    public static String formatDateTime(Date date) {
        if (date == null) return null;
        return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime()
                .format(DATETIME_FORMAT);
    }

    // ==================== 3. 日期计算 ====================
    /**
     * 日期加指定天数
     */
    public static Date addDays(Date date, int days) {
        if (date == null) return null;
        LocalDateTime localDateTime = toLocalDateTime(date);
        return toDate(localDateTime.plus(days, ChronoUnit.DAYS));
    }

    /**
     * 日期加指定周数
     */
    public static Date addWeeks(Date date, int weeks) {
        if (date == null) return null;
        LocalDateTime localDateTime = toLocalDateTime(date);
        return toDate(localDateTime.plus(weeks, ChronoUnit.WEEKS));
    }

    /**
     * 日期加指定月数
     */
    public static Date addMonths(Date date, int months) {
        if (date == null) return null;
        LocalDateTime localDateTime = toLocalDateTime(date);
        return toDate(localDateTime.plus(months, ChronoUnit.MONTHS));
    }

    // ==================== 4. 时间范围判断 ====================
    /**
     * 判断 date 是否在 [start, end] 之间（包含边界）
     */
    public static boolean isBetween(Date date, Date start, Date end) {
        if (date == null || start == null || end == null) return false;
        long time = date.getTime();
        long startTime = start.getTime();
        long endTime = end.getTime();
        return time >= startTime && time <= endTime;
    }

    /**
     * 判断两个日期是否同一天
     */
    public static boolean isSameDay(Date date1, Date date2) {
        if (date1 == null || date2 == null) return false;
        return Objects.equals(formatDate(date1), formatDate(date2));
    }

    // ==================== 内部转换方法 ====================
    private static LocalDateTime toLocalDateTime(Date date) {
        return Instant.ofEpochMilli(date.getTime())
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();
    }

    private static Date toDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }

    // ==================== 测试方法 ====================
    public static void main(String[] args) {
        // 测试示例
        Date now = new Date();
        System.out.println("当前时间：" + formatDateTime(now));

        Date tomorrow = addDays(now, 1);
        System.out.println("明天：" + formatDate(tomorrow));

        Date parsed = parseDate("2025-04-05");
        System.out.println("解析日期：" + formatDateTime(parsed));

        System.out.println("是否在范围内：" + isBetween(now, parseDate("2025-04-01"), parseDate("2025-04-30")));
    }
}