package com.hoteltracker.service.dtos.response;

import lombok.Data;
import java.util.List;

@Data
public class HotelDetailResponse {
    private Integer id;
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private String phone;
    private String description;
    private String imageUrl; // Main image
    private List<String> galleryImages; // Additional images
    private Integer starRating;
    private Double reviewScore;
    private List<String> amenities; // General hotel amenities
    private String policies; // Hotel policies
    private List<RoomTypeDetailResponse> roomTypes;
}