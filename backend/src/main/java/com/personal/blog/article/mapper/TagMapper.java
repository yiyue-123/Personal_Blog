package com.personal.blog.article.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personal.blog.article.entity.Tag;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TagMapper extends BaseMapper<Tag> {
}
