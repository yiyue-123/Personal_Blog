package com.personal.blog.infra.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "blog.jwt")
public class JwtProperties {

    private String secret = "change-me-to-a-very-long-secret-key";
    private long expireSeconds = 86400;
    private String issuer = "personal-blog";
}
