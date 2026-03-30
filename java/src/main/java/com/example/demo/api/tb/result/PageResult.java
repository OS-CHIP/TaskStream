package com.example.demo.api.tb.result;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public  class PageResult<T> {
    private List<T> list;
    private boolean hasNext;
}