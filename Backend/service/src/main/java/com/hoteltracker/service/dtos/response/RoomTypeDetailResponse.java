package com.hoteltracker.service.dtos.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomTypeDetailResponse {
    private Integer id;
    private String name;
    private String description;
    private String images; // JSON string of image URLs
    private BigDecimal price; // Price for this room type based on search dates
    private Integer capacity;
    private String size; // e.g., "35m²"
    private List<String> amenities;
    private Integer availableRooms; // Number of available rooms of this type
    private Boolean breakfastIncluded;
    private Boolean freeCancellation;
}