package com.personal.blog.search.service;

import com.personal.blog.common.PageResult;
import com.personal.blog.search.dto.SearchResultDTO;

public interface SearchService {

    PageResult<SearchResultDTO> search(String keyword, long page, long pageSize);
}
