package com.personal.blog.comment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personal.blog.comment.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
