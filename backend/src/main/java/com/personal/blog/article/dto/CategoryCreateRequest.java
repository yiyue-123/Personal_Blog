package com.personal.blog.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryCreateRequest {

    @NotBlank
    @Size(max = 50)
    private String name;

    @NotNull
    private Integer sort;
}
