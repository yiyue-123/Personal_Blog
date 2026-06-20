package com.personal.blog.article.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ArticleDTO {

    private Long id;
    private String title;
    private String content;
    private String summary;
    private Long categoryId;
    private String categoryName;
    private Long userId;
    private Integer status;
    private Integer viewCount;
    private List<TagDTO> tags;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
