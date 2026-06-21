package com.personal.blog.article.service;

import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.dto.CategoryCreateRequest;

import java.util.List;

public interface CategoryService {

    List<CategoryDTO> listCategories();

    boolean existsById(Long categoryId);

    CategoryDTO getOrCreateCategory(String categoryName);

    CategoryDTO createCategory(CategoryCreateRequest request);

    CategoryDTO updateCategory(Long id, CategoryCreateRequest request);

    void deleteCategory(Long id);
}
