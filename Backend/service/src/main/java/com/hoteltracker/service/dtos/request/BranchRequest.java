package com.hoteltracker.service.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BranchRequest {
    @NotBlank(message = "Tên chi nhánh không được để trống")
    private String name;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;

    private String phone;
    private String description;
    private String imageUrl;
}
