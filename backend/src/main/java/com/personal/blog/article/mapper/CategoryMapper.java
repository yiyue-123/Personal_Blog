package com.personal.blog.article.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.personal.blog.article.entity.Category;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CategoryMapper extends BaseMapper<Category> {
}
