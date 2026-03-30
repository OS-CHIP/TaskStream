package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.Component;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
* @author ji156
* @description 针对表【component】的数据库操作Mapper
* @createDate 2025-02-10 17:00:17
* @Entity com.example.demo.api.tb.domain.Component
*/
@Mapper
public interface ComponentMapper extends BaseMapper<Component> {

}




