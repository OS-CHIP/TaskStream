package com.example.demo.api.tb.domain.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;


@Data
public class TaskFieldCreateDTO {

    private Long taskTypeId;
    @NotBlank(message = "名称不能为空")
    @Size(min = 1, max = 100)
    @NotBlank(message = "名称不能为空")
    @Size(max = 20, message = "名称长度不能超过20个字符")
//    @Pattern(regexp = "^[^\\u4e00-\\u9fa5]*$", message = "名称不能包含汉字")
    private String name;
    @NotBlank(message = "字段类型不能为空")
    private String type;
    @NotBlank(message = "字段标签不能为空")
    private String label;
    private Boolean isRequired;
    private Boolean isHidden;
    private String options; // JSON 字符串
    @NotNull(message = "排序字段不能为空")
    private Integer sort;

}
