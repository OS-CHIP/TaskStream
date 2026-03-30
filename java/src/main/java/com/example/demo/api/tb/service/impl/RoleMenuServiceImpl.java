package  com.example.demo.api.tb.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.RoleMenu;
import com.example.demo.api.tb.mapper.RoleMenuMapper;
import  com.example.demo.api.tb.service.RoleMenuService;

import org.springframework.stereotype.Service;

/**
* @author ji156
* @description 针对表【role_menu(角色和菜单关联表)】的数据库操作Service实现
* @createDate 2025-02-10 17:00:33
*/
@Service
public class RoleMenuServiceImpl extends ServiceImpl<RoleMenuMapper, RoleMenu>
    implements RoleMenuService{

}




