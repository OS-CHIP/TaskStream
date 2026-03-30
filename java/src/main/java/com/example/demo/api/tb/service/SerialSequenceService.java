package com.example.demo.api.tb.service;


import com.baomidou.mybatisplus.extension.service.IService;
import com.example.demo.api.tb.domain.SerialSequence;


public interface SerialSequenceService extends IService<SerialSequence> {


    String generate(String bizType, String scopeKey ,Long projectId);
}
