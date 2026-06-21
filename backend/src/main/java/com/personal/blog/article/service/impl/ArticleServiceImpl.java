package com.personal.blog.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.personal.blog.article.dto.ArticleCreateRequest;
import com.personal.blog.article.dto.ArticleDTO;
import com.personal.blog.article.dto.ArticleListItemDTO;
import com.personal.blog.article.dto.ArchiveItemDTO;
import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.entity.Article;
import com.personal.blog.article.entity.ArticleTag;
import com.personal.blog.article.entity.Category;
import com.personal.blog.article.entity.Tag;
import com.personal.blog.article.mapper.ArticleMapper;
import com.personal.blog.article.mapper.ArticleTagMapper;
import com.personal.blog.article.mapper.CategoryMapper;
import com.personal.blog.article.mapper.TagMapper;
import com.personal.blog.article.service.ArticleService;
import com.personal.blog.article.service.CategoryService;
import com.personal.blog.article.service.TagService;
import com.personal.blog.common.BusinessException;
import com.personal.blog.common.PageResult;
import com.personal.blog.infra.xss.XssFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleServiceImpl implements ArticleService {

    private static final DateTimeFormatter ARCHIVE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final ArticleMapper articleMapper;
    private final CategoryMapper categoryMapper;
    private final ArticleTagMapper articleTagMapper;
    private final TagMapper tagMapper;
    private final CategoryService categoryService;
    private final TagService tagService;
    private final XssFilter xssFilter;

    @Override
    public PageResult<ArticleListItemDTO> listPublishedArticles(String tagName, long page, long pageSize) {
        LambdaQueryWrapper<Article> queryWrapper = new LambdaQueryWrapper<Article>()
            .eq(Article::getStatus, 2)
            .orderByDesc(Article::getCreateTime);

        if (tagName != null && !tagName.isBlank()) {
            Tag tag = tagMapper.selectOne(new LambdaQueryWrapper<Tag>().eq(Tag::getName, tagName.trim()));
            if (tag == null) {
                return new PageResult<ArticleListItemDTO>(0L, page, pageSize, Collections.emptyList());
            }

            List<Long> articleIds = articleTagMapper.selectList(
                    new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, tag.getId())
                ).stream()
                .map(ArticleTag::getArticleId)
                .distinct()
                .toList();

            if (articleIds.isEmpty()) {
                return new PageResult<ArticleListItemDTO>(0L, page, pageSize, Collections.emptyList());
            }

            queryWrapper.in(Article::getId, articleIds);
        }

        Page<Article> articlePage = articleMapper.selectPage(new Page<>(page, pageSize), queryWrapper);
        return new PageResult<>(articlePage.getTotal(), page, pageSize, buildListItems(articlePage.getRecords()));
    }

    @Override
    public PageResult<ArticleListItemDTO> listUserArticles(Long userId, long page, long pageSize) {
        Page<Article> articlePage = articleMapper.selectPage(
            new Page<>(page, pageSize),
            new LambdaQueryWrapper<Article>()
                .eq(Article::getUserId, userId)
                .orderByDesc(Article::getCreateTime)
        );
        return new PageResult<>(articlePage.getTotal(), page, pageSize, buildListItems(articlePage.getRecords()));
    }

    @Override
    public ArticleDTO getArticleDetail(Long id) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("?????");
        }
        return toDetail(article);
    }

    @Override
    public List<ArticleListItemDTO> listHotArticles() {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
            .eq(Article::getStatus, 2)
            .orderByDesc(Article::getViewCount)
            .last("limit 10"));
        return buildListItems(articles);
    }

    @Override
    public List<ArchiveItemDTO> listArchives() {
        List<Article> articles = articleMapper.selectList(new LambdaQueryWrapper<Article>()
            .eq(Article::getStatus, 2)
            .orderByDesc(Article::getCreateTime));
        List<ArticleListItemDTO> items = buildListItems(articles);

        Map<String, List<ArticleListItemDTO>> grouped = items.stream()
            .collect(Collectors.groupingBy(
                item -> item.getCreateTime().format(ARCHIVE_FORMATTER),
                LinkedHashMap::new,
                Collectors.toList()
            ));

        return grouped.entrySet().stream()
            .map(entry -> ArchiveItemDTO.builder()
                .yearMonth(entry.getKey())
                .articles(entry.getValue())
                .build())
            .toList();
    }

    @Override
    @Transactional
    public ArticleDTO createArticle(Long operatorUserId, ArticleCreateRequest request) {
        Long categoryId = resolveCategoryId(request);

        Article article = new Article();
        article.setTitle(xssFilter.cleanPlainText(request.getTitle()));
        article.setContent(request.getContent());
        article.setSummary(xssFilter.cleanPlainText(request.getSummary()));
        article.setCategoryId(categoryId);
        article.setUserId(operatorUserId);
        article.setStatus(request.getStatus());
        article.setViewCount(0);
        articleMapper.insert(article);

        replaceArticleTags(article.getId(), request.getTags());
        return toDetail(article);
    }

    @Override
    @Transactional
    public ArticleDTO updateArticle(Long id, Long operatorUserId, ArticleCreateRequest request) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("?????");
        }
        ensureAuthor(article, operatorUserId);

        Long categoryId = resolveCategoryId(request);
        article.setTitle(xssFilter.cleanPlainText(request.getTitle()));
        article.setContent(request.getContent());
        article.setSummary(xssFilter.cleanPlainText(request.getSummary()));
        article.setCategoryId(categoryId);
        article.setUserId(operatorUserId);
        article.setStatus(request.getStatus());
        articleMapper.updateById(article);

        replaceArticleTags(article.getId(), request.getTags());
        return toDetail(article);
    }

    @Override
    @Transactional
    public void deleteArticle(Long id) {
        if (articleMapper.deleteById(id) == 0) {
            throw new BusinessException("?????");
        }
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, id));
    }

    @Override
    @Transactional
    public void deleteArticle(Long id, Long operatorUserId, boolean admin) {
        Article article = articleMapper.selectById(id);
        if (article == null) {
            throw new BusinessException("?????");
        }
        if (!admin) {
            ensureAuthor(article, operatorUserId);
        }
        deleteArticle(id);
    }

    @Override
    public boolean existsById(Long articleId) {
        return articleMapper.selectById(articleId) != null;
    }

    @Override
    public List<CategoryDTO> listCategories() {
        return categoryService.listCategories();
    }

    @Override
    public List<TagDTO> listTags() {
        return tagService.listTags();
    }

    private ArticleDTO toDetail(Article article) {
        Category category = article.getCategoryId() == null ? null : categoryMapper.selectById(article.getCategoryId());
        List<TagDTO> tags = tagService.getTagsByArticleIds(List.of(article.getId()))
            .getOrDefault(article.getId(), Collections.emptyList());

        return ArticleDTO.builder()
            .id(article.getId())
            .title(article.getTitle())
            .content(article.getContent())
            .summary(article.getSummary())
            .categoryId(article.getCategoryId())
            .categoryName(category == null ? null : category.getName())
            .userId(article.getUserId())
            .status(article.getStatus())
            .viewCount(article.getViewCount())
            .tags(tags)
            .createTime(article.getCreateTime())
            .updateTime(article.getUpdateTime())
            .build();
    }

    private List<ArticleListItemDTO> buildListItems(List<Article> articles) {
        if (articles.isEmpty()) {
            return Collections.emptyList();
        }

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

        List<ArticleListItemDTO> result = new ArrayList<>();
        for (Article article : articles) {
            Category category = categoryMap.get(article.getCategoryId());
            result.add(ArticleListItemDTO.builder()
                .id(article.getId())
                .userId(article.getUserId())
                .title(article.getTitle())
                .summary(article.getSummary())
                .categoryId(article.getCategoryId())
                .categoryName(category == null ? null : category.getName())
                .status(article.getStatus())
                .viewCount(article.getViewCount())
                .tags(tagMap.getOrDefault(article.getId(), Collections.emptyList()))
                .createTime(article.getCreateTime())
                .build());
        }
        return result;
    }

    private void ensureAuthor(Article article, Long operatorUserId) {
        if (operatorUserId == null || !operatorUserId.equals(article.getUserId())) {
            throw new BusinessException("??????????");
        }
    }

    private void replaceArticleTags(Long articleId, List<String> tagNames) {
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getArticleId, articleId));
        List<Long> tagIds = tagService.ensureTags(tagNames);
        for (Long tagId : tagIds) {
            ArticleTag relation = new ArticleTag();
            relation.setArticleId(articleId);
            relation.setTagId(tagId);
            articleTagMapper.insert(relation);
        }
    }

    private Long resolveCategoryId(ArticleCreateRequest request) {
        if (request.getCategoryId() != null && categoryService.existsById(request.getCategoryId())) {
            return request.getCategoryId();
        }

        return categoryService.getOrCreateCategory(request.getCategoryName()).getId();
    }
}
