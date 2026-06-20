package com.personal.blog.search.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.entity.Article;
import com.personal.blog.article.entity.Category;
import com.personal.blog.article.mapper.ArticleMapper;
import com.personal.blog.article.mapper.CategoryMapper;
import com.personal.blog.article.service.TagService;
import com.personal.blog.common.PageResult;
import com.personal.blog.search.dto.SearchResultDTO;
import com.personal.blog.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchServiceImpl implements SearchService {

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final TagService tagService;

    @Override
    public PageResult<SearchResultDTO> search(String keyword, long page, long pageSize) {
        Page<Article> resultPage = articleMapper.selectPage(
            new Page<>(page, pageSize),
            new LambdaQueryWrapper<Article>()
                .eq(Article::getStatus, 2)
                .and(wrapper -> wrapper.like(Article::getTitle, keyword).or().like(Article::getContent, keyword))
                .orderByDesc(Article::getCreateTime)
        );

        List<Article> articles = resultPage.getRecords();
        List<Long> articleIds = articles.stream().map(Article::getId).toList();
        List<Long> categoryIds = articles.stream()
            .map(Article::getCategoryId)
            .filter(id -> id != null)
            .distinct()
            .toList();

        Map<Long, Category> categoryMap = categoryIds.isEmpty()
            ? Collections.emptyMap()
            : categoryMapper.selectBatchIds(categoryIds).stream()
                .collect(Collectors.toMap(Category::getId, Function.identity()));
        Map<Long, List<TagDTO>> tagMap = tagService.getTagsByArticleIds(articleIds);

        List<SearchResultDTO> records = articles.stream()
            .map(article -> {
                Category category = categoryMap.get(article.getCategoryId());
                return SearchResultDTO.builder()
                    .articleId(article.getId())
                    .title(article.getTitle())
                    .summary(article.getSummary())
                    .categoryName(category == null ? null : category.getName())
                    .tags(tagMap.getOrDefault(article.getId(), List.of()))
                    .build();
            })
            .toList();

        return new PageResult<>(resultPage.getTotal(), page, pageSize, records);
    }
}
