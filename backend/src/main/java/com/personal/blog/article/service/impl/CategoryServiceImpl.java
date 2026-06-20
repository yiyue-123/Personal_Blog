package com.personal.blog.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personal.blog.article.dto.CategoryCreateRequest;
import com.personal.blog.article.dto.CategoryDTO;
import com.personal.blog.article.entity.Category;
import com.personal.blog.article.mapper.CategoryMapper;
import com.personal.blog.article.service.CategoryService;
import com.personal.blog.common.BusinessException;
import com.personal.blog.infra.xss.XssFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final XssFilter xssFilter;

    @Override
    public List<CategoryDTO> listCategories() {
        return categoryMapper.selectList(new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSort)
                .orderByAsc(Category::getId))
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Override
    public boolean existsById(Long categoryId) {
        return categoryMapper.selectById(categoryId) != null;
    }

    @Override
    public CategoryDTO createCategory(CategoryCreateRequest request) {
        ensureNameUnique(request.getName(), null);
        Category category = new Category();
        category.setName(xssFilter.cleanPlainText(request.getName()));
        category.setSort(request.getSort());
        categoryMapper.insert(category);
        return toDto(category);
    }

    @Override
    public CategoryDTO updateCategory(Long id, CategoryCreateRequest request) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }
        ensureNameUnique(request.getName(), id);
        category.setName(xssFilter.cleanPlainText(request.getName()));
        category.setSort(request.getSort());
        categoryMapper.updateById(category);
        return toDto(category);
    }

    @Override
    public void deleteCategory(Long id) {
        if (categoryMapper.deleteById(id) == 0) {
            throw new BusinessException("分类不存在");
        }
    }

    private void ensureNameUnique(String name, Long excludeId) {
        Category existing = categoryMapper.selectOne(new LambdaQueryWrapper<Category>()
            .eq(Category::getName, name)
            .ne(excludeId != null, Category::getId, excludeId)
            .last("limit 1"));
        if (existing != null) {
            throw new BusinessException("分类名称已存在");
        }
    }

    private CategoryDTO toDto(Category category) {
        return CategoryDTO.builder()
            .id(category.getId())
            .name(category.getName())
            .sort(category.getSort())
            .build();
    }
}
