package com.personal.blog.user.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.personal.blog.common.BusinessException;
import com.personal.blog.infra.security.BlogUserDetails;
import com.personal.blog.infra.security.JwtUtils;
import com.personal.blog.infra.xss.XssFilter;
import com.personal.blog.user.dto.LoginRequest;
import com.personal.blog.user.dto.LoginResponse;
import com.personal.blog.user.dto.RegisterRequest;
import com.personal.blog.user.dto.UserProfileDTO;
import com.personal.blog.user.dto.UserSimpleDTO;
import com.personal.blog.user.entity.User;
import com.personal.blog.user.mapper.UserMapper;
import com.personal.blog.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final XssFilter xssFilter;

    @Override
    public UserProfileDTO register(RegisterRequest request) {
        User existing = userMapper.selectOne(new LambdaQueryWrapper<User>()
            .eq(User::getUsername, request.getUsername()));
        if (existing != null) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(xssFilter.cleanPlainText(request.getNickname()));
        user.setRole("USER");
        user.setStatus(1);
        userMapper.insert(user);

        return UserProfileDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .role(user.getRole())
            .build();
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
            .role(user.getRole())
            .token(jwtUtils.generateToken(user.getId(), user.getRole()))
            .build();
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

    private UserSimpleDTO toSimpleDto(User user) {
        return UserSimpleDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .nickname(user.getNickname())
            .avatar(user.getAvatar())
            .build();
    }
}
