package com.personal.blog.comment.dto;

import com.personal.blog.user.dto.UserSimpleDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class CommentDTO {

    private Long id;
    private Long articleId;
    private Long userId;
    private Long parentId;
    private String content;
    private UserSimpleDTO user;
    private UserSimpleDTO replyToUser;
    private LocalDateTime createTime;
    private List<CommentDTO> replies;
}
