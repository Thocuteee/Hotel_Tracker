package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.UserCreateRequest;
import com.hoteltracker.service.dtos.response.UserResponse;
import com.hoteltracker.service.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public User toEntity(UserCreateRequest request) {
        if (request == null) {
            return null;
        }
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .role(request.getRole())
                .build();
    }
}
