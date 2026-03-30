package com.example.demo.api.tb.config.Handler;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.util.ObjectUtil;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.example.demo.api.tb.domain.BaseEntity;
import com.example.demo.api.tb.domain.UpdateLog;
import com.example.demo.api.tb.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * MP注入处理器
 *
 * @author jizitao
 */
@Component
@Slf4j
public class InjectionMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        try {
            if (ObjectUtil.isNotNull(metaObject) && metaObject.getOriginalObject() instanceof BaseEntity baseEntity) {
                // 获取当前时间作为创建时间和更新时间，如果创建时间不为空，则使用创建时间，否则使用当前时间
                Date current = ObjectUtils.notNull(baseEntity.getCreateTime(), new Date());
                baseEntity.setCreateTime(current);
                baseEntity.setUpdateTime(current);
                long userId = StpUtil.getLoginIdAsLong();
                // 填充创建人、更新人和创建部门信息
                baseEntity.setCreateBy(userId);
                baseEntity.setUpdateBy(userId);
            } else {
                Date date = new Date();
                this.strictInsertFill(metaObject, "createTime", Date.class, date);
                this.strictInsertFill(metaObject, "updateTime", Date.class, date);
                this.strictInsertFill(metaObject, "createBy", Long.class, StpUtil.getLoginIdAsLong());
                this.strictInsertFill(metaObject, "updateBy", Long.class, StpUtil.getLoginIdAsLong());
            }
        } catch (Exception e) {
            log.error("自动填充异常", e);
        }
    }


    @Override
    public void updateFill(MetaObject metaObject) {
        try {
            if (ObjectUtil.isNotNull(metaObject) && metaObject.getOriginalObject() instanceof BaseEntity baseEntity) {
                // 获取当前时间作为更新时间，无论原始对象中的更新时间是否为空都填充
                long userId = StpUtil.getLoginIdAsLong();
                Date current = new Date();
                baseEntity.setUpdateTime(current);
                // 获取当前登录用户的ID，并填充更新人信息
                baseEntity.setUpdateBy(userId);
            } else {
                this.strictUpdateFill(metaObject, "updateTime", Date.class, new Date());
                this.strictUpdateFill(metaObject, "updateBy", Long.class, StpUtil.getLoginIdAsLong());
            }
        } catch (Exception e) {
            log.error("自动填充异常", e);
        }
    }


}
