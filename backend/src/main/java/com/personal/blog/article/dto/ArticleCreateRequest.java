package com.personal.blog.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ArticleCreateRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    private String content;

    @Size(max = 500)
    private String summary;

    @NotNull
    private Long categoryId;

    @NotEmpty
    private List<String> tags;

    @NotNull
    private Integer status;
}
