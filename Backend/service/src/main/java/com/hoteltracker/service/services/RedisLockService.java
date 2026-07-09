package com.hoteltracker.service.services;

public interface RedisLockService {
    boolean acquireLock(Integer roomTypeId, String lockKey, long expirationMinutes);
    void releaseLock(Integer roomTypeId, String lockKey);
    long countLockedSlots(Integer roomTypeId);
}
