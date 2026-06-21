package com.personal.blog.admin.controller;

import com.personal.blog.admin.dto.AdminDashboardDTO;
import com.personal.blog.admin.service.AdminService;
import com.personal.blog.article.dto.ArticleCreateRequest;
import com.personal.blog.article.dto.ArticleDTO;
import com.personal.blog.article.dto.CategoryCreateRequest;
import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.dto.TagCreateRequest;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.service.ArticleService;
import com.personal.blog.article.service.CategoryService;
import com.personal.blog.article.service.TagService;
import com.personal.blog.common.Result;
import com.personal.blog.infra.security.BlogUserDetails;
import com.personal.blog.user.dto.RegisterApplicationDTO;
import com.personal.blog.user.dto.RegisterApplicationReviewRequest;
import com.personal.blog.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminArticleController {

    private final ArticleService articleService;
    private final CategoryService categoryService;
    private final TagService tagService;
    private final AdminService adminService;
    private final UserService userService;

    @PostMapping("/articles")
    public Result<ArticleDTO> create(@Valid @RequestBody ArticleCreateRequest request,
                                     @AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(articleService.createArticle(userDetails.getUserId(), request));
    }

    @PutMapping("/articles/{id}")
    public Result<ArticleDTO> update(@PathVariable Long id,
                                     @Valid @RequestBody ArticleCreateRequest request,
                                     @AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(articleService.updateArticle(id, userDetails.getUserId(), request));
    }

    @DeleteMapping("/articles/{id}")
    public Result<Void> delete(@PathVariable Long id,
                               @AuthenticationPrincipal BlogUserDetails userDetails) {
        articleService.deleteArticle(id, userDetails.getUserId(), true);
        return Result.success();
    }

    @GetMapping("/dashboard")
    public Result<AdminDashboardDTO> dashboard() {
        return Result.success(adminService.dashboard());
    }

    @GetMapping("/register-applications")
    public Result<List<RegisterApplicationDTO>> registerApplications(Integer status) {
        return Result.success(userService.listRegisterApplications(status));
    }

    @GetMapping("/register-applications/{id}")
    public Result<RegisterApplicationDTO> registerApplicationDetail(@PathVariable Long id) {
        return Result.success(userService.getRegisterApplication(id));
    }

    @PostMapping("/register-applications/{id}/approve")
    public Result<RegisterApplicationDTO> approveRegisterApplication(
        @PathVariable Long id,
        @AuthenticationPrincipal BlogUserDetails userDetails,
        @RequestBody(required = false) RegisterApplicationReviewRequest request) {
        String reviewReason = request == null ? null : request.getReviewReason();
        return Result.success(userService.approveRegisterApplication(id, userDetails.getUserId(), reviewReason));
    }

    @PostMapping("/register-applications/{id}/reject")
    public Result<RegisterApplicationDTO> rejectRegisterApplication(
        @PathVariable Long id,
        @AuthenticationPrincipal BlogUserDetails userDetails,
        @Valid @RequestBody RegisterApplicationReviewRequest request) {
        return Result.success(userService.rejectRegisterApplication(id, userDetails.getUserId(), request));
    }

    @GetMapping("/categories")
    public Result<List<CategoryDTO>> categories() {
        return Result.success(categoryService.listCategories());
    }

    @PostMapping("/categories")
    public Result<CategoryDTO> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        return Result.success(categoryService.createCategory(request));
    }

    @PutMapping("/categories/{id}")
    public Result<CategoryDTO> updateCategory(@PathVariable Long id,
                                              @Valid @RequestBody CategoryCreateRequest request) {
        return Result.success(categoryService.updateCategory(id, request));
    }

    @DeleteMapping("/categories/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success();
    }

    @GetMapping("/tags")
    public Result<List<TagDTO>> tags() {
        return Result.success(tagService.listTags());
    }

    @PostMapping("/tags")
    public Result<TagDTO> createTag(@Valid @RequestBody TagCreateRequest request) {
        return Result.success(tagService.createTag(request));
    }

    @PutMapping("/tags/{id}")
    public Result<TagDTO> updateTag(@PathVariable Long id,
                                    @Valid @RequestBody TagCreateRequest request) {
        return Result.success(tagService.updateTag(id, request));
    }

    @DeleteMapping("/tags/{id}")
    public Result<Void> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return Result.success();
    }
}
