package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.AuthRequest;
import com.hoteltracker.service.dtos.request.UserCreateRequest;
import com.hoteltracker.service.dtos.response.AuthResponse;
import com.hoteltracker.service.dtos.response.UserResponse;

public interface AuthService {
    UserResponse register(UserCreateRequest request);
    AuthResponse login(AuthRequest request);
}