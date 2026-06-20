package com.personal.blog.admin.service;

import com.personal.blog.admin.dto.AdminDashboardDTO;

public interface AdminService {

    AdminDashboardDTO dashboard();

    void initializeAdminIfAbsent(String username, String password, String nickname);
}
