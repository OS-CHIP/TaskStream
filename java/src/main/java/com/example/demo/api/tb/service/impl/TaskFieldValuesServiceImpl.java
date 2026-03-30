package  com.example.demo.api.tb.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.api.tb.domain.TaskFieldValues;
import com.example.demo.api.tb.domain.Task;
import com.example.demo.api.tb.domain.dto.FieldValuesDTO;
import com.example.demo.api.tb.mapper.FieldValuesMapper;
import com.example.demo.api.tb.service.TaskFieldValuesService;

import com.example.demo.api.tb.service.TaskService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;

/**
* @author ji156
* @description 针对表【field_values】的数据库操作Service实现
* @createDate 2025-02-10 17:00:23
*/
@Service
public class TaskFieldValuesServiceImpl extends ServiceImpl<FieldValuesMapper, TaskFieldValues>
    implements TaskFieldValuesService {


}




