package com.personal.blog.user.service;

import com.personal.blog.infra.security.BlogUserDetails;
import com.personal.blog.user.dto.LoginRequest;
import com.personal.blog.user.dto.LoginResponse;
import com.personal.blog.user.dto.RegisterApplicationDTO;
import com.personal.blog.user.dto.RegisterApplicationReviewRequest;
import com.personal.blog.user.dto.RegisterRequest;
import com.personal.blog.user.dto.UserProfileDTO;
import com.personal.blog.user.dto.UserSimpleDTO;

import java.util.Collection;
import java.util.List;
import java.util.Map;

public interface UserService {

    RegisterApplicationDTO register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserProfileDTO getProfile(Long userId);

    BlogUserDetails loadUserDetailsById(Long userId);

    Map<Long, UserSimpleDTO> getSimpleProfiles(Collection<Long> userIds);

    List<RegisterApplicationDTO> listRegisterApplications(Integer status);

    RegisterApplicationDTO getRegisterApplication(Long applicationId);

    RegisterApplicationDTO approveRegisterApplication(Long applicationId, Long reviewerId, String reviewReason);

    RegisterApplicationDTO rejectRegisterApplication(Long applicationId, Long reviewerId, RegisterApplicationReviewRequest request);
}
