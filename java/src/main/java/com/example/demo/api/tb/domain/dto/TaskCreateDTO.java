package com.example.demo.api.tb.domain.dto;

import cn.hutool.core.date.DateTime;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.example.demo.api.tb.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.Accessors;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 任务创建DTO
 *
 * @author
 * @date 2023/08/15
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Accessors(chain = true) // 支持链式调用，如 new Task().setId(1).setTaskTitle("xxx")
public class TaskCreateDTO extends BaseEntity {

    /**
     * 任务ID
     */
    private Long id;

    /**
     * 任务类型
     */
    @NotNull(message = "任务类型不能为空")
    private Long taskTypeId;

    /**
     * 创建标签
     */
    @NotBlank(message = "任务标签不能为空")
    private String tags;

    /**
     * 项目id
     */
    @NotNull(message = "项目id不能为空")
    private Long projectId;

    /**
     * 任务标题
     */

    @NotBlank(message = "任务标题不能为空")
    private String taskTitle;

    /**
     * 任务描述
     */
    @NotBlank(message = "任务描述不能为空")
    private String description;

    /**
     * 状态
     */
    private String status;

    @NotBlank(message = "任务百分比不能为空")
    @Min(value = 0, message = "任务百分比不能小于0")
    @Max(value = 100, message = "任务百分比不能大于100")
    private String completionPercentage;

    /**
     * 优先级
     */
    @NotBlank(message = "优先级不能为空")
    private String priority;

    /**
     * 负责人
     */
    @NotBlank(message = "负责人不能为空")
    private String assigner;


    /**
     * 任务参与者列表
     * 存储有只读权限的用户ID，多个ID用英文逗号分隔，例如 "1001,1002,1003"
     */
    private String observers;

    /**
     * 分配给
     */
    @NotBlank(message = "执行人不能为空")
    private String assignee;

    /**
     * 截止时间
     */
    @NotNull(message = "截止时间不能为空")
    private Date dueDate;

    /**
     * 开始时间
     */
    @NotNull(message = "开始时间不能为空")
    private Date startTime;


    /**
     * 预估工时
     */
    @NotNull(message = "预估工时不能为空")
    @DecimalMin(value = "0.00", message = "预估工时不能小于0")
    @DecimalMax(value = "999999.99", message = "预估工时不能大于999999.99")
    private BigDecimal estimatedHours;

    /**
     * 附件id
     */
    private String attachmentIds;


    /**
     * 关联父任务ID
     */
    // 可选：多个父任务ID
    private List<Long> parentTaskIds;

    /**
     * 自定义字段  key = field.name（英文标识），value = 字段值
     */
    private Map<String, Object> customFields;


}