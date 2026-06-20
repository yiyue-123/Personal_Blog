package com.personal.blog.comment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentCreateRequest {

    private Long parentId;

    @NotBlank
    @Size(max = 1000)
    private String content;
}
