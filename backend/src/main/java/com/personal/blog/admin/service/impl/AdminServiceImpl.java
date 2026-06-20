package com.personal.blog.admin.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personal.blog.admin.dto.AdminDashboardDTO;
import com.personal.blog.admin.service.AdminService;
import com.personal.blog.article.entity.Article;
import com.personal.blog.article.entity.Category;
import com.personal.blog.article.entity.Tag;
import com.personal.blog.article.mapper.ArticleMapper;
import com.personal.blog.article.mapper.CategoryMapper;
import com.personal.blog.article.mapper.TagMapper;
import com.personal.blog.comment.entity.Comment;
import com.personal.blog.comment.mapper.CommentMapper;
import com.personal.blog.infra.xss.XssFilter;
import com.personal.blog.user.entity.User;
import com.personal.blog.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final ArticleMapper articleMapper;
    private final CommentMapper commentMapper;
    private final UserMapper userMapper;
    private final CategoryMapper categoryMapper;
    private final TagMapper tagMapper;
    private final PasswordEncoder passwordEncoder;
    private final XssFilter xssFilter;

    @Override
    public AdminDashboardDTO dashboard() {
        long articleCount = articleMapper.selectCount(null);
        long publishedArticleCount = articleMapper.selectCount(new LambdaQueryWrapper<Article>().eq(Article::getStatus, 2));
        return AdminDashboardDTO.builder()
            .articleCount(articleCount)
            .publishedArticleCount(publishedArticleCount)
            .draftArticleCount(articleCount - publishedArticleCount)
            .commentCount(commentMapper.selectCount(new LambdaQueryWrapper<Comment>().eq(Comment::getStatus, 1)))
            .userCount(userMapper.selectCount(null))
            .categoryCount(categoryMapper.selectCount(new LambdaQueryWrapper<Category>()))
            .tagCount(tagMapper.selectCount(new LambdaQueryWrapper<Tag>()))
            .build();
    }

    @Override
    public void initializeAdminIfAbsent(String username, String password, String nickname) {
        Long adminCount = userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getRole, "ADMIN"));
        if (adminCount != null && adminCount > 0) {
            return;
        }

        User admin = new User();
        admin.setUsername(username);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setNickname(xssFilter.cleanPlainText(nickname));
        admin.setRole("ADMIN");
        admin.setStatus(1);
        userMapper.insert(admin);
    }
}
