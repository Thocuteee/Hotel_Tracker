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
    private String propertyType;
    private String status;
    private Integer starRating;
    private String email;
    private String checkInTime;
    private String checkOutTime;
    private Double latitude;
    private Double longitude;
    private String website;
    private String slug;
    private String galleryImages;
}
