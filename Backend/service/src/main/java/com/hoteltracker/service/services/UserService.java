package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.UserCreateRequest;
import com.hoteltracker.service.dtos.request.UserUpdateRequest;
import com.hoteltracker.service.dtos.response.UserResponse;
import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse createUser(UserCreateRequest request);
    UserResponse updateUser(Integer id, UserUpdateRequest request);
    void deleteUser(Integer id);
}
