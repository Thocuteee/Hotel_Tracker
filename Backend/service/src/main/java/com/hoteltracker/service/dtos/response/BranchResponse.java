package com.hoteltracker.service.dtos.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BranchResponse {
    private Integer id;
    private String name;
    private String address;
    private String phone;
    private String description;
    private String imageUrl;
}
