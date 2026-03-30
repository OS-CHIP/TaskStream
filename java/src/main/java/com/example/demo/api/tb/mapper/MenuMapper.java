package com.example.demo.api.tb.mapper;

import com.example.demo.api.tb.domain.Menu;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
* @author ji156
* @description 针对表【menu(菜单权限表)】的数据库操作Mapper
* @createDate 2025-02-10 17:00:25
* @Entity com.example.demo.api.tb.domain.Menu
*/
@Mapper
public interface MenuMapper extends BaseMapper<Menu> {

}




