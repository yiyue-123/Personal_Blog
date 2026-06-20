package com.personal.blog.comment.controller;

import com.personal.blog.comment.dto.CommentCreateRequest;
import com.personal.blog.comment.dto.CommentDTO;
import com.personal.blog.comment.service.CommentService;
import com.personal.blog.common.Result;
import com.personal.blog.infra.security.BlogUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/articles/{articleId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping
    public Result<List<CommentDTO>> list(@PathVariable Long articleId) {
        return Result.success(commentService.listByArticleId(articleId));
    }

    @PostMapping
    public Result<CommentDTO> create(@PathVariable Long articleId,
                                     @Valid @RequestBody CommentCreateRequest request,
                                     @AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(commentService.createComment(articleId, userDetails.getUserId(), request));
    }
}
