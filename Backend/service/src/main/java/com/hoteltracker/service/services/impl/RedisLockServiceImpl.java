package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.services.RedisLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisLockServiceImpl implements RedisLockService {

    private final StringRedisTemplate redisTemplate;
    private static final String LOCK_PREFIX = "room_lock:";

    @Override
    public boolean acquireLock(Integer roomTypeId, String lockKey, long expirationMinutes) {
        String key = LOCK_PREFIX + roomTypeId + ":" + lockKey;
        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, "LOCKED", expirationMinutes, TimeUnit.MINUTES);
        return Boolean.TRUE.equals(success);
    }

    @Override
    public void releaseLock(Integer roomTypeId, String lockKey) {
        String key = LOCK_PREFIX + roomTypeId + ":" + lockKey;
        redisTemplate.delete(key);
    }

    @Override
    public long countLockedSlots(Integer roomTypeId) {
        String pattern = LOCK_PREFIX + roomTypeId + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        return keys != null ? keys.size() : 0;
    }
}
