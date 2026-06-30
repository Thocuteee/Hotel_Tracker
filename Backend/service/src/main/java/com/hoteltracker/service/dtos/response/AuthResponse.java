package com.hoteltracker.service.dtos.response;

import lombok.Builder;
import lombok.Data;
import com.hoteltracker.service.dtos.response.UserResponse;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private UserResponse user;
}
