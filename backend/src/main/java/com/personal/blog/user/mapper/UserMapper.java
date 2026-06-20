package com.personal.blog.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personal.blog.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
