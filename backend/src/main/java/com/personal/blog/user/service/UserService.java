package com.personal.blog.user.service;

import com.personal.blog.infra.security.BlogUserDetails;
import com.personal.blog.user.dto.LoginRequest;
import com.personal.blog.user.dto.LoginResponse;
import com.personal.blog.user.dto.RegisterRequest;
import com.personal.blog.user.dto.UserProfileDTO;
import com.personal.blog.user.dto.UserSimpleDTO;

import java.util.Collection;
import java.util.Map;

public interface UserService {

    UserProfileDTO register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    BlogUserDetails loadUserDetailsById(Long userId);

    Map<Long, UserSimpleDTO> getSimpleProfiles(Collection<Long> userIds);
}
