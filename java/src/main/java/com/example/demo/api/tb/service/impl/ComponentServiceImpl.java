package  com.example.demo.api.tb.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.Component;
import com.example.demo.api.tb.mapper.ComponentMapper;
import  com.example.demo.api.tb.service.ComponentService;

import org.springframework.stereotype.Service;

/**
* @author ji156
* @description 针对表【component】的数据库操作Service实现
* @createDate 2025-02-10 17:00:17
*/
@Service
public class ComponentServiceImpl extends ServiceImpl<ComponentMapper, Component> implements ComponentService{

}




