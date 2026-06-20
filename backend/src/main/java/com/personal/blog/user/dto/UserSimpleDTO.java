package com.personal.blog.user.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSimpleDTO {

    private Long id;
    private String username;
    private String nickname;
    private String avatar;
}
