package com.personal.blog.article.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("t_article_tag")
public class ArticleTag {

    private Long articleId;
    private Long tagId;
}
