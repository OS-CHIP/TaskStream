package  com.example.demo.api.tb.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Menu;
import com.example.demo.api.tb.mapper.MenuMapper;
import  com.example.demo.api.tb.service.MenuService;

import org.springframework.stereotype.Service;

/**
* @author ji156
* @description 针对表【menu(菜单权限表)】的数据库操作Service实现
* @createDate 2025-02-10 17:00:25
*/
@Service
public class MenuServiceImpl extends ServiceImpl<MenuMapper, Menu>
    implements MenuService{

}




