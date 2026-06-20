package com.personal.blog.search.controller;

import com.personal.blog.common.PageResult;
import com.personal.blog.common.Result;
import com.personal.blog.search.dto.SearchResultDTO;
import com.personal.blog.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public Result<PageResult<SearchResultDTO>> search(@RequestParam String keyword,
                                                      @RequestParam(defaultValue = "1") long page,
                                                      @RequestParam(defaultValue = "10") long pageSize) {
        return Result.success(searchService.search(keyword, page, pageSize));
    }
}
