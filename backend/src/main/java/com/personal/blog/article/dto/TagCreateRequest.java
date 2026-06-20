package com.personal.blog.article.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TagCreateRequest {

    @NotBlank
    @Size(max = 30)
    private String name;
}
