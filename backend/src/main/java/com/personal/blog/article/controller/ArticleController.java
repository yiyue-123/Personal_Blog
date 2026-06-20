package com.personal.blog.article.controller;

import com.personal.blog.article.dto.ArticleDTO;
import com.personal.blog.article.dto.ArticleListItemDTO;
import com.personal.blog.article.dto.ArchiveItemDTO;
import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.service.ArticleService;
import com.personal.blog.common.PageResult;
import com.personal.blog.common.Result;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {

    private final ArticleService articleService;

    @GetMapping
    public Result<PageResult<ArticleListItemDTO>> listArticles(
        @RequestParam(defaultValue = "1") long page,
        @RequestParam(defaultValue = "10") long pageSize) {
        return Result.success(articleService.listPublishedArticles(page, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ArticleDTO> getDetail(@PathVariable Long id) {
        return Result.success(articleService.getArticleDetail(id));
    }

    @GetMapping("/hot")
    public Result<List<ArticleListItemDTO>> hotArticles() {
        return Result.success(articleService.listHotArticles());
    }

    @GetMapping("/archive")
    public Result<List<ArchiveItemDTO>> archive() {
        return Result.success(articleService.listArchives());
    }

    @GetMapping("/categories")
    public Result<List<CategoryDTO>> categories() {
        return Result.success(articleService.listCategories());
    }

    @GetMapping("/tags")
    public Result<List<TagDTO>> tags() {
        return Result.success(articleService.listTags());
    }
}
