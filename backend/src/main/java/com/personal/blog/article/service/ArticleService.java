package com.personal.blog.article.service;

import com.personal.blog.article.dto.ArticleCreateRequest;
import com.personal.blog.article.dto.ArticleDTO;
import com.personal.blog.article.dto.ArticleListItemDTO;
import com.personal.blog.article.dto.ArchiveItemDTO;
import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.common.PageResult;

import java.util.List;

public interface ArticleService {

    PageResult<ArticleListItemDTO> listPublishedArticles(String tagName, long page, long pageSize);

    PageResult<ArticleListItemDTO> listUserArticles(Long userId, long page, long pageSize);

    ArticleDTO getArticleDetail(Long id);

    List<ArticleListItemDTO> listHotArticles();

    List<ArchiveItemDTO> listArchives();

    ArticleDTO createArticle(Long operatorUserId, ArticleCreateRequest request);

    ArticleDTO updateArticle(Long id, Long operatorUserId, ArticleCreateRequest request);

    void deleteArticle(Long id);

    void deleteArticle(Long id, Long operatorUserId, boolean admin);

    boolean existsById(Long articleId);

    List<CategoryDTO> listCategories();

    List<TagDTO> listTags();
}
