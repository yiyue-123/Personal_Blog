package com.personal.blog.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterApplicationReviewRequest {

    @Size(max = 255)
    private String reviewReason;
}
