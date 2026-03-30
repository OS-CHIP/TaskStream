package com.example.demo.api.tb.domain.dto;

import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.io.Serializable;

@Data
@Accessors(chain = true)
public class TaskTypeCreateDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 类型名称
     */
    @NotBlank(message = "任务类型名称不能为空")
    @Size(min = 1, max = 100)
    private String name;

    /**
     * 描述信息
     */
    @NotBlank(message = "任务类型描述不能为空")
    @Size(max = 500)
    private String description;

    /**
     * 所属项目ID
     */
    @NotNull( message = "所属项目ID不能为空")
    private Long projectId;


    /**
     * 是否隐藏：0-隐藏，1-显示
     */
    private Boolean isHidden;
}
