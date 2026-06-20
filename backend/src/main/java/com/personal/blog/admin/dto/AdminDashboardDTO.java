package com.personal.blog.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardDTO {

    private Long articleCount;
    private Long publishedArticleCount;
    private Long draftArticleCount;
    private Long commentCount;
    private Long userCount;
    private Long categoryCount;
    private Long tagCount;
}
