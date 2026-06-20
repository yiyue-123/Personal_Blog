package com.personal.blog.article.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.personal.blog.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@TableName("t_article")
@EqualsAndHashCode(callSuper = true)
public class Article extends BaseEntity {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String title;
    private String content;
    private String summary;
    private Long categoryId;
    private Long userId;
    private Integer status;
    private Integer viewCount;
}
