package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.Attachment;
import com.example.demo.api.tb.domain.TaskRelation;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
* @author ji156
* @description 针对表【comment】的数据库操作Service
* @createDate 2025-02-10 17:00:07
*/
public interface TaskRelationService extends IService<TaskRelation> {

    List<Long> getAcyclicTaskList(List<Long> taskIds);

    Boolean wouldCreateCycle(Long parentTaskId, Long childTaskId);
}


