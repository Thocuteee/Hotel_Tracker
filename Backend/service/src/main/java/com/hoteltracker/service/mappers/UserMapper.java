package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.UserCreateRequest;
import com.hoteltracker.service.dtos.response.UserResponse;
import com.hoteltracker.service.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

@Mapper(componentModel = "spring")
public abstract class UserMapper {

    @Autowired
    protected PasswordEncoder passwordEncoder;

    public abstract UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "passwordHash", expression = "java(passwordEncoder.encode(request.getPassword()))")
    public abstract User toEntity(UserCreateRequest request);
}
