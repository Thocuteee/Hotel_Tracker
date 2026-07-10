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
    private String imageUrl; 
    private List<String> galleryImages; 
    private Integer starRating;
    private Double reviewScore;
    private List<String> amenities; 
    private String policies; 
    private List<RoomTypeDetailResponse> roomTypes;
    private String email;
    private String checkInTime;
    private String checkOutTime;
}