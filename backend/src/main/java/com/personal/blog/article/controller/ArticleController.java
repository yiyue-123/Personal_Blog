package com.personal.blog.article.controller;

import com.personal.blog.article.dto.ArticleCreateRequest;
import com.personal.blog.article.dto.ArticleDTO;
import com.personal.blog.article.dto.ArticleListItemDTO;
import com.personal.blog.article.dto.ArchiveItemDTO;
import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.service.ArticleService;
import com.personal.blog.common.PageResult;
import com.personal.blog.common.Result;
import com.personal.blog.infra.security.BlogUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
        @RequestParam(required = false) String tag,
        @RequestParam(defaultValue = "1") long page,
        @RequestParam(defaultValue = "10") long pageSize) {
        return Result.success(articleService.listPublishedArticles(tag, page, pageSize));
    }

    @GetMapping("/mine")
    public Result<PageResult<ArticleListItemDTO>> listMyArticles(
        @RequestParam(defaultValue = "1") long page,
        @RequestParam(defaultValue = "10") long pageSize,
        @AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(articleService.listUserArticles(userDetails.getUserId(), page, pageSize));
    }

    @GetMapping("/{id}")
    public Result<ArticleDTO> getDetail(@PathVariable Long id) {
        return Result.success(articleService.getArticleDetail(id));
    }

    @PostMapping
    public Result<ArticleDTO> create(@Valid @RequestBody ArticleCreateRequest request,
                                     @AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(articleService.createArticle(userDetails.getUserId(), request));
    }

    @PutMapping("/{id}")
    public Result<ArticleDTO> update(@PathVariable Long id,
                                     @Valid @RequestBody ArticleCreateRequest request,
                                     @AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(articleService.updateArticle(id, userDetails.getUserId(), request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @AuthenticationPrincipal BlogUserDetails userDetails) {
        boolean admin = "ADMIN".equalsIgnoreCase(userDetails.getRole());
        articleService.deleteArticle(id, userDetails.getUserId(), admin);
        return Result.success();
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
