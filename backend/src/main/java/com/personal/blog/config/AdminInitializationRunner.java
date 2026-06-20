package com.personal.blog.config;

import com.personal.blog.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializationRunner implements CommandLineRunner {

    private final AdminService adminService;

    @Value("${blog.admin.username:admin}")
    private String username;

    @Value("${blog.admin.password:admin123456}")
    private String password;

    @Value("${blog.admin.nickname:Administrator}")
    private String nickname;

    @Override
    public void run(String... args) {
        adminService.initializeAdminIfAbsent(username, password, nickname);
    }
}
