package com.hoteltracker.service.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LockRoomResponse {
    private String lockKey;
    private Long expirationMinutes;
}
