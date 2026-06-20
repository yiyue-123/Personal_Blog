package com.personal.blog.search.dto;

import com.personal.blog.article.dto.TagDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SearchResultDTO {

    private Long articleId;
    private String title;
    private String summary;
    private String categoryName;
    private List<TagDTO> tags;
}
