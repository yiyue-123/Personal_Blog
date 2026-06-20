package com.personal.blog.article.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personal.blog.article.dto.TagCreateRequest;
import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.entity.ArticleTag;
import com.personal.blog.article.entity.Tag;
import com.personal.blog.article.mapper.ArticleTagMapper;
import com.personal.blog.article.mapper.TagMapper;
import com.personal.blog.article.service.TagService;
import com.personal.blog.common.BusinessException;
import com.personal.blog.infra.xss.XssFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagServiceImpl implements TagService {

    private final TagMapper tagMapper;
    private final ArticleTagMapper articleTagMapper;
    private final XssFilter xssFilter;

    @Override
    public List<TagDTO> listTags() {
        return tagMapper.selectList(new LambdaQueryWrapper<Tag>().orderByAsc(Tag::getName))
            .stream()
            .map(this::toDto)
            .toList();
    }

    @Override
    @Transactional
    public List<Long> ensureTags(List<String> tagNames) {
        List<String> normalizedNames = tagNames.stream()
            .filter(Objects::nonNull)
            .map(String::trim)
            .filter(name -> !name.isEmpty())
            .distinct()
            .toList();
        if (normalizedNames.isEmpty()) {
            return Collections.emptyList();
        }

        List<Tag> existingTags = tagMapper.selectList(new LambdaQueryWrapper<Tag>().in(Tag::getName, normalizedNames));
        Map<String, Tag> existingMap = existingTags.stream()
            .collect(Collectors.toMap(Tag::getName, Function.identity()));

        List<Long> tagIds = new ArrayList<>();
        for (String name : normalizedNames) {
            Tag tag = existingMap.get(name);
            if (tag == null) {
                tag = new Tag();
                tag.setName(xssFilter.cleanPlainText(name));
                tagMapper.insert(tag);
            }
            tagIds.add(tag.getId());
        }
        return tagIds;
    }

    @Override
    public Map<Long, List<TagDTO>> getTagsByArticleIds(List<Long> articleIds) {
        if (articleIds == null || articleIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<ArticleTag> relations = articleTagMapper.selectList(new LambdaQueryWrapper<ArticleTag>()
            .in(ArticleTag::getArticleId, articleIds));
        if (relations.isEmpty()) {
            return Collections.emptyMap();
        }

        Set<Long> tagIds = relations.stream().map(ArticleTag::getTagId).collect(Collectors.toSet());
        Map<Long, Tag> tagMap = tagMapper.selectBatchIds(tagIds).stream()
            .collect(Collectors.toMap(Tag::getId, Function.identity()));

        Map<Long, List<TagDTO>> result = new LinkedHashMap<>();
        for (ArticleTag relation : relations) {
            Tag tag = tagMap.get(relation.getTagId());
            if (tag == null) {
                continue;
            }
            result.computeIfAbsent(relation.getArticleId(), ignored -> new ArrayList<>()).add(toDto(tag));
        }
        return result;
    }

    @Override
    public TagDTO createTag(TagCreateRequest request) {
        ensureNameUnique(request.getName(), null);
        Tag tag = new Tag();
        tag.setName(xssFilter.cleanPlainText(request.getName()));
        tagMapper.insert(tag);
        return toDto(tag);
    }

    @Override
    public TagDTO updateTag(Long id, TagCreateRequest request) {
        Tag tag = tagMapper.selectById(id);
        if (tag == null) {
            throw new BusinessException("标签不存在");
        }
        ensureNameUnique(request.getName(), id);
        tag.setName(xssFilter.cleanPlainText(request.getName()));
        tagMapper.updateById(tag);
        return toDto(tag);
    }

    @Override
    public void deleteTag(Long id) {
        articleTagMapper.delete(new LambdaQueryWrapper<ArticleTag>().eq(ArticleTag::getTagId, id));
        if (tagMapper.deleteById(id) == 0) {
            throw new BusinessException("标签不存在");
        }
    }

    private void ensureNameUnique(String name, Long excludeId) {
        Tag existing = tagMapper.selectOne(new LambdaQueryWrapper<Tag>()
            .eq(Tag::getName, name)
            .ne(excludeId != null, Tag::getId, excludeId)
            .last("limit 1"));
        if (existing != null) {
            throw new BusinessException("标签名称已存在");
        }
    }

    private TagDTO toDto(Tag tag) {
        return TagDTO.builder()
            .id(tag.getId())
            .name(tag.getName())
            .build();
    }
}
