package com.personal.blog.comment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personal.blog.article.service.ArticleService;
import com.personal.blog.comment.dto.CommentCreateRequest;
import com.personal.blog.comment.dto.CommentDTO;
import com.personal.blog.comment.entity.Comment;
import com.personal.blog.comment.mapper.CommentMapper;
import com.personal.blog.comment.service.CommentService;
import com.personal.blog.common.BusinessException;
import com.personal.blog.infra.xss.XssFilter;
import com.personal.blog.user.dto.UserSimpleDTO;
import com.personal.blog.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentMapper commentMapper;
    private final ArticleService articleService;
    private final UserService userService;
    private final XssFilter xssFilter;

    @Override
    public List<CommentDTO> listByArticleId(Long articleId) {
        List<Comment> comments = commentMapper.selectList(new LambdaQueryWrapper<Comment>()
            .eq(Comment::getArticleId, articleId)
            .eq(Comment::getStatus, 1)
            .orderByAsc(Comment::getCreateTime));

        Map<Long, UserSimpleDTO> userMap = userService.getSimpleProfiles(
            comments.stream().map(Comment::getUserId).collect(Collectors.toSet())
        );

        Map<Long, Comment> commentMap = comments.stream()
            .collect(Collectors.toMap(Comment::getId, comment -> comment));
        Map<Long, CommentDTO> dtoMap = new HashMap<>();
        List<CommentDTO> roots = new ArrayList<>();

        for (Comment comment : comments) {
            dtoMap.put(comment.getId(), toDto(comment, userMap));
        }

        for (Comment comment : comments) {
            CommentDTO dto = dtoMap.get(comment.getId());
            if (comment.getParentId() == null) {
                roots.add(dto);
                continue;
            }

            Comment parent = commentMap.get(comment.getParentId());
            if (parent == null) {
                roots.add(dto);
                continue;
            }

            dto.setReplyToUser(userMap.get(parent.getUserId()));
            Long rootId = findRootId(parent, commentMap);
            CommentDTO rootDto = dtoMap.get(rootId);
            if (rootDto != null) {
                rootDto.getReplies().add(dto);
            }
        }

        return roots;
    }

    @Override
    public CommentDTO createComment(Long articleId, Long userId, CommentCreateRequest request) {
        if (!articleService.existsById(articleId)) {
            throw new BusinessException("文章不存在");
        }
        Comment comment = new Comment();
        comment.setArticleId(articleId);
        comment.setUserId(userId);
        comment.setParentId(request.getParentId());
        comment.setContent(xssFilter.cleanPlainText(request.getContent()));
        comment.setStatus(1);
        commentMapper.insert(comment);

        Map<Long, UserSimpleDTO> userMap = userService.getSimpleProfiles(List.of(userId));
        CommentDTO dto = toDto(comment, userMap);
        if (request.getParentId() != null) {
            Comment parent = commentMapper.selectById(request.getParentId());
            if (parent != null) {
                dto.setReplyToUser(userService.getSimpleProfiles(List.of(parent.getUserId())).get(parent.getUserId()));
            }
        }
        return dto;
    }

    private CommentDTO toDto(Comment comment, Map<Long, UserSimpleDTO> userMap) {
        return CommentDTO.builder()
            .id(comment.getId())
            .articleId(comment.getArticleId())
            .userId(comment.getUserId())
            .parentId(comment.getParentId())
            .content(comment.getContent())
            .user(userMap.get(comment.getUserId()))
            .createTime(comment.getCreateTime())
            .replies(new ArrayList<>())
            .build();
    }

    private Long findRootId(Comment comment, Map<Long, Comment> commentMap) {
        Comment current = comment;
        while (current.getParentId() != null) {
            Comment parent = commentMap.get(current.getParentId());
            if (parent == null) {
                break;
            }
            current = parent;
        }
        return current.getId();
    }
}
