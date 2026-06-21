package com.personal.blog.user.controller;

import com.personal.blog.common.Result;
import com.personal.blog.infra.security.BlogUserDetails;
import com.personal.blog.user.dto.LoginRequest;
import com.personal.blog.user.dto.LoginResponse;
import com.personal.blog.user.dto.RegisterApplicationDTO;
import com.personal.blog.user.dto.RegisterRequest;
import com.personal.blog.user.dto.UserProfileDTO;
import com.personal.blog.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public Result<RegisterApplicationDTO> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success(userService.register(request));
    }

    @PostMapping("/login")
    public Result<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(userService.login(request));
    }

    @GetMapping("/profile")
    public Result<UserProfileDTO> profile(@AuthenticationPrincipal BlogUserDetails userDetails) {
        return Result.success(userService.getProfile(userDetails.getUserId()));
    }
}
