package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.request.AuthRequest;
import com.hoteltracker.service.dtos.request.UserCreateRequest;
import com.hoteltracker.service.dtos.response.AuthResponse;
import com.hoteltracker.service.dtos.response.UserResponse;
import com.hoteltracker.service.exceptions.DuplicateResourceException;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.mappers.UserMapper;
import com.hoteltracker.service.model.User;
import com.hoteltracker.service.repositories.UserRepository;
import com.hoteltracker.service.security.JwtService;
import com.hoteltracker.service.services.AuthService;
import lombok.RequiredArgsConstructor;

import com.hoteltracker.service.exceptions.BadRequestException;
import org.springframework.security.crypto.password.PasswordEncoder; 
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public UserResponse register(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email này đã được sử dụng!");
        }

        User user = userMapper.toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        
        User savedUser = userRepository.save(user);
        return userMapper.toResponse(savedUser);
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản với email này"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Mật khẩu không chính xác");
        }

        return AuthResponse.builder()
                .accessToken(jwtService.generateToken(user)) 
                .refreshToken(jwtService.generateRefreshToken(user))
                .user(userMapper.toResponse(user))
                .build();
    }
}