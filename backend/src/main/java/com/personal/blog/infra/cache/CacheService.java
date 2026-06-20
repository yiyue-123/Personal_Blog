package com.personal.blog.infra.cache;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CacheService {

    private final StringRedisTemplate stringRedisTemplate;

    public Optional<String> get(String key) {
        return Optional.ofNullable(stringRedisTemplate.opsForValue().get(key));
    }

    public void set(String key, String value, Duration ttl) {
        stringRedisTemplate.opsForValue().set(key, value, ttl);
    }

    public Boolean setIfAbsent(String key, String value, Duration ttl) {
        return stringRedisTemplate.opsForValue().setIfAbsent(key, value, ttl);
    }

    public void delete(String key) {
        stringRedisTemplate.delete(key);
    }
}
