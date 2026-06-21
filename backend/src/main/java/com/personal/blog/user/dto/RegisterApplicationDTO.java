package com.personal.blog.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RegisterApplicationDTO {

    private Long id;
    private String username;
    private String nickname;
    private String avatar;
    private Integer status;
    private String reviewReason;
    private Long reviewBy;
    private LocalDateTime reviewTime;
    private LocalDateTime createTime;
}
