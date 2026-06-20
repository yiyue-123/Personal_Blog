package com.personal.blog.comment.service;

import com.personal.blog.comment.dto.CommentCreateRequest;
import com.personal.blog.comment.dto.CommentDTO;

import java.util.List;

public interface CommentService {

    List<CommentDTO> listByArticleId(Long articleId);

    CommentDTO createComment(Long articleId, Long userId, CommentCreateRequest request);
}
