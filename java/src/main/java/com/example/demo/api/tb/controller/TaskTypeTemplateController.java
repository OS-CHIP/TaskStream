package com.example.demo.api.tb.controller;

import cn.dev33.satoken.util.SaResult;
import com.example.demo.api.tb.config.annotation.NotForSuperAdmin;
import com.example.demo.api.tb.config.exception.BusinessException;
import com.example.demo.api.tb.domain.TaskFields;
import com.example.demo.api.tb.domain.TaskType;
import com.example.demo.api.tb.domain.dto.TaskFieldCreateDTO;
import com.example.demo.api.tb.domain.dto.TaskFieldUpdateDTO;
import com.example.demo.api.tb.domain.dto.TaskTypeCreateDTO;
import com.example.demo.api.tb.domain.dto.TaskTypeUpdateDTO;
import com.example.demo.api.tb.service.TaskTypeTemplateService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.validation.Valid;
import java.util.List;

@RestController
@Slf4j
@Validated
@RequestMapping("taskTemplate")
public class TaskTypeTemplateController {

    @Resource
    private TaskTypeTemplateService templateService;


    /**
     * 保存任务类型模板
     *
     * @return
     */
    @PostMapping("/saveTaskType")
    @NotForSuperAdmin
    public SaResult saveTaskType(@RequestBody @Valid TaskTypeCreateDTO taskTypeCreateDTO) {
        try {
            // 执行保存操作
            templateService.saveTaskType(taskTypeCreateDTO);

            // 记录操作日志

            return SaResult.ok().setMsg("任务类型保存成功");
        } catch (Exception e) {
            log.error("保存任务类型失败，任务类型信息: {}", taskTypeCreateDTO, e);
            return SaResult.error("任务类型保存失败: " + e.getMessage());
        }
    }

    /**
     * 删除任务类型模板
     *
     * @return
     */

    @GetMapping("/deleteTaskType/{taskTypeId}")
    @NotForSuperAdmin
    public SaResult deleteTaskType(@PathVariable Long taskTypeId) {
        // 参数校验
        if (taskTypeId == null || taskTypeId <= 0) {
            return SaResult.error("任务类型ID无效");
        }

        try {
            templateService.deleteTaskType(taskTypeId);
            return SaResult.ok("任务类型删除成功");
        } catch (Exception e) {
            // 记录日志
            log.error("删除任务类型失败，taskTypeId: {}", taskTypeId, e);
            return SaResult.error("任务类型删除失败：" + e.getMessage());
        }
    }


    /**
     * 修改任务类型模板
     *
     * @return
     */
    @PostMapping("/updateTaskType")
    @NotForSuperAdmin
    public SaResult updateTaskType(@RequestBody @Valid TaskTypeUpdateDTO taskTypeUpdateDTO) {
        templateService.updateTaskType(taskTypeUpdateDTO);
        return SaResult.ok("任务类型更新成功");
    }


    /**
     * 通过项目id获取任务类型列表
     *
     * @return
     */

    @GetMapping("/getTaskTypeListByProjectId/{projectId}")
    public SaResult getTaskTypeListByProjectId(@PathVariable Long projectId) {
        List<TaskType> taskTypes = templateService.getTaskTypeListByProjectId(projectId);
        return SaResult.ok().setData(taskTypes).setMsg("获取任务类型列表成功");
    }


    /**
     * 保存自定义字段信息
     *
     * @param dto
     * @return
     */
    @PostMapping("/saveTaskTemplate")
    @NotForSuperAdmin
    public SaResult saveTaskTemplate(@RequestBody @Valid TaskFieldCreateDTO dto) {
        try {
            // 参数校验
            if (dto == null) {
                return SaResult.error("参数不能为空");
            }
            // 权限校验（根据实际业务添加）
            // SaTokenUtil.checkPermission("task:template:save");

            templateService.saveTaskTemplate(dto);
            return SaResult.ok().setMsg("模板保存成功");
        } catch (Exception e) {
            // 记录错误日志
            log.error("保存任务模板失败，参数: {}", dto, e);
            throw new BusinessException("模板保存失败");
        }
    }

    /**
     * 修改自定义字段信息
     *
     * @param dto
     * @return
     */
    @PostMapping("/updateTaskTemplate")
    @NotForSuperAdmin
    public SaResult updateTaskTemplate(@RequestBody @Valid TaskFieldUpdateDTO dto) {
        try {
            // 参数校验
            if (dto == null) {
                return SaResult.error("参数不能为空");
            }
            // 权限校验（根据实际业务添加）
            // SaTokenUtil.checkPermission("task:template:save");

            templateService.updateTaskTemplate(dto);


            return SaResult.ok().setMsg("模板修改成功");
        } catch (BusinessException e) {
            // 记录错误日志
            log.error("修改任务模板失败，参数: {}", dto, e);
            throw new BusinessException(e.getMessage());
        }catch (Exception e){
            throw new BusinessException("模板修改失败");
        }
    }

    /**
     * 删除自定义字段信息

     */
    @GetMapping("/deleteTaskTemplate/{taskFieldId}")
    @NotForSuperAdmin
    public SaResult deleteTaskTemplate(@PathVariable Long taskFieldId) {
        try {
            templateService.deleteTaskTemplate(taskFieldId);
            return SaResult.ok().setMsg("模板删除成功");
        } catch (BusinessException e) {
            // 记录错误日志
            throw new BusinessException(e.getMessage());
        } catch (Exception e) {
            log.error("删除任务模板失败，参数: {}", taskFieldId, e);
            throw new BusinessException("模板删除失败");
        }

    }


    /**
     * 获取模板下的动态字段定义（用于渲染表单）
     */
    @GetMapping("/getTemplateFieldsByTaskTypeId/{taskTypeId}")
    public SaResult getTemplateFieldsByTaskTypeId(@PathVariable Long taskTypeId) {
        // 参数校验
        if (taskTypeId == null || taskTypeId <= 0) {
            return SaResult.error("任务类型ID参数不合法").setCode(500);
        }

        try {
            List<TaskFields> fields = templateService.getTemplateFieldsByTaskTypeId(taskTypeId);
            return SaResult.ok().setData(fields).setMsg("获取模板下的动态字段定义成功");
        } catch (Exception e) {
            log.error("获取模板字段失败，任务类型ID: {}", taskTypeId, e);
            return SaResult.error("获取模板字段失败：" + e.getMessage()).setCode(500);
        }
    }
}