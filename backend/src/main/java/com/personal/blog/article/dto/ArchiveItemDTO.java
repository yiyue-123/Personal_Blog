package com.personal.blog.article.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ArchiveItemDTO {

    private String yearMonth;
    private List<ArticleListItemDTO> articles;
}
