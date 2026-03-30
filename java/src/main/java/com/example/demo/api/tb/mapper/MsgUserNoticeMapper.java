package com.example.demo.api.tb.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import com.example.demo.api.tb.domain.MsgUserNotice;
import com.example.demo.api.tb.domain.vo.UserNoticeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MsgUserNoticeMapper extends BaseMapper<MsgUserNotice> {

    void insertBatchSomeColumn(List<MsgUserNotice> userNotices);


    List<UserNoticeVO> selectPageByUserId(@Param("userId") Long userId,@Param("isRead") Boolean isRead,@Param("offset") int offset,@Param("size") int size);
}