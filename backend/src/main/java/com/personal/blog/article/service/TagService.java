package com.personal.blog.article.service;

import com.personal.blog.article.dto.TagDTO;
import com.personal.blog.article.dto.TagCreateRequest;

import java.util.List;
import java.util.Map;

public interface TagService {

    List<TagDTO> listTags();

    List<Long> ensureTags(List<String> tagNames);

    Map<Long, List<TagDTO>> getTagsByArticleIds(List<Long> articleIds);

    TagDTO createTag(TagCreateRequest request);

    TagDTO updateTag(Long id, TagCreateRequest request);

    void deleteTag(Long id);
}
