package com.personal.blog.common;

import java.util.concurrent.ConcurrentHashMap;

public class BusinessException extends RuntimeException {

    private final Integer code;

    private ConcurrentHashMap<String,Object> data = new ConcurrentHashMap<>();

    public BusinessException(String message) {
        this(400, message);
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;

    }

    public Integer getCode() {
        return code;
    }
}
