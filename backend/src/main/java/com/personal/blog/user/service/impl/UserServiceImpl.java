package com.personal.blog.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personal.blog.common.BusinessException;
import com.personal.blog.infra.security.BlogUserDetails;
import com.personal.blog.infra.security.JwtUtils;
import com.personal.blog.infra.xss.XssFilter;
import com.personal.blog.user.dto.LoginRequest;
import com.personal.blog.user.dto.LoginResponse;
import com.personal.blog.user.dto.RegisterApplicationDTO;
import com.personal.blog.user.dto.RegisterApplicationReviewRequest;
import com.personal.blog.user.dto.RegisterRequest;
import com.personal.blog.user.dto.UserProfileDTO;
import com.personal.blog.user.dto.UserSimpleDTO;
import com.personal.blog.user.entity.RegisterApplication;
import com.personal.blog.user.entity.User;
import com.personal.blog.user.mapper.RegisterApplicationMapper;
import com.personal.blog.user.mapper.UserMapper;
import com.personal.blog.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final int APPLICATION_PENDING = 0;
    private static final int APPLICATION_APPROVED = 1;
    private static final int APPLICATION_REJECTED = 2;

    private final UserMapper userMapper;
    private final RegisterApplicationMapper registerApplicationMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final XssFilter xssFilter;

    @Override
    @Transactional
    public RegisterApplicationDTO register(RegisterRequest request) {
        User existing = userMapper.selectOne(new LambdaQueryWrapper<User>()
            .eq(User::getUsername, request.getUsername())
            .last("limit 1"));
        if (existing != null) {
            throw new BusinessException("用户名已存在");
        }

        RegisterApplication pendingApplication = registerApplicationMapper.selectOne(
            new LambdaQueryWrapper<RegisterApplication>()
                .eq(RegisterApplication::getUsername, request.getUsername())
                .eq(RegisterApplication::getStatus, APPLICATION_PENDING)
                .last("limit 1")
        );
        if (pendingApplication != null) {
            throw new BusinessException("该用户名已有待审核申请");
        }

        RegisterApplication application = new RegisterApplication();
        application.setUsername(request.getUsername());
        application.setPassword(passwordEncoder.encode(request.getPassword()));
        application.setNickname(xssFilter.cleanPlainText(request.getNickname()));
        application.setStatus(APPLICATION_PENDING);
        registerApplicationMapper.insert(application);
        return toApplicationDto(application);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
            .eq(User::getUsername, request.getUsername()));
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }

        return LoginResponse.builder()
            .userId(user.getId())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .role(user.getRole())
            .token(jwtUtils.generateToken(user.getId(), user.getRole()))
            .build();
    }

    @Override
    public UserProfileDTO getProfile(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(404, "用户不存在");
        }
        return toProfileDto(user);
    }

    @Override
    public BlogUserDetails loadUserDetailsById(Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException(401, "用户不存在");
        }
        return new BlogUserDetails(
            user.getId(),
            user.getUsername(),
            user.getPassword(),
            user.getRole(),
            user.getStatus()
        );
    }

    @Override
    public Map<Long, UserSimpleDTO> getSimpleProfiles(Collection<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return userMapper.selectBatchIds(userIds).stream()
            .collect(Collectors.toMap(User::getId, this::toSimpleDto));
    }

    @Override
    public List<RegisterApplicationDTO> listRegisterApplications(Integer status) {
        return registerApplicationMapper.selectList(
                new LambdaQueryWrapper<RegisterApplication>()
                    .eq(status != null, RegisterApplication::getStatus, status)
                    .orderByAsc(RegisterApplication::getStatus)
                    .orderByDesc(RegisterApplication::getCreateTime)
            ).stream()
            .map(this::toApplicationDto)
            .toList();
    }

    @Override
    public RegisterApplicationDTO getRegisterApplication(Long applicationId) {
        RegisterApplication application = requireApplication(applicationId);
        return toApplicationDto(application);
    }

    @Override
    @Transactional
    public RegisterApplicationDTO approveRegisterApplication(Long applicationId, Long reviewerId, String reviewReason) {
        RegisterApplication application = requirePendingApplication(applicationId);

        User existing = userMapper.selectOne(new LambdaQueryWrapper<User>()
            .eq(User::getUsername, application.getUsername())
            .last("limit 1"));
        if (existing != null) {
            throw new BusinessException("用户名已存在，无法通过该申请");
        }

        User user = new User();
        user.setUsername(application.getUsername());
        user.setPassword(application.getPassword());
        user.setNickname(application.getNickname());
        user.setAvatar(application.getAvatar());
        user.setRole("USER");
        user.setStatus(1);
        userMapper.insert(user);

        application.setStatus(APPLICATION_APPROVED);
        application.setReviewReason(xssFilter.cleanPlainText(reviewReason));
        application.setReviewBy(reviewerId);
        application.setReviewTime(LocalDateTime.now());
        registerApplicationMapper.updateById(application);
        return toApplicationDto(application);
    }

    @Override
    @Transactional
    public RegisterApplicationDTO rejectRegisterApplication(Long applicationId, Long reviewerId, RegisterApplicationReviewRequest request) {
        RegisterApplication application = requirePendingApplication(applicationId);
        application.setStatus(APPLICATION_REJECTED);
        application.setReviewReason(xssFilter.cleanPlainText(request.getReviewReason()));
        application.setReviewBy(reviewerId);
        application.setReviewTime(LocalDateTime.now());
        registerApplicationMapper.updateById(application);
        return toApplicationDto(application);
    }

    private RegisterApplication requireApplication(Long applicationId) {
        RegisterApplication application = registerApplicationMapper.selectById(applicationId);
        if (application == null) {
            throw new BusinessException(404, "注册申请不存在");
        }
        return application;
    }

    private RegisterApplication requirePendingApplication(Long applicationId) {
        RegisterApplication application = requireApplication(applicationId);
        if (application.getStatus() == null || application.getStatus() != APPLICATION_PENDING) {
            throw new BusinessException("该注册申请不是待审批状态");
        }
        return application;
    }

    private UserProfileDTO toProfileDto(User user) {
        return UserProfileDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .avatar(user.getAvatar())
            .role(user.getRole())
            .build();
    }

    private UserSimpleDTO toSimpleDto(User user) {
        return UserSimpleDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .avatar(user.getAvatar())
            .build();
    }

    private RegisterApplicationDTO toApplicationDto(RegisterApplication application) {
        return RegisterApplicationDTO.builder()
            .id(application.getId())
            .username(application.getUsername())
            .nickname(application.getNickname())
            .avatar(application.getAvatar())
            .status(application.getStatus())
            .reviewReason(application.getReviewReason())
            .reviewBy(application.getReviewBy())
            .reviewTime(application.getReviewTime())
            .createTime(application.getCreateTime())
            .build();
    }
}
