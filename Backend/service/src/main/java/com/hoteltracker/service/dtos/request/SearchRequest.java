package com.hoteltracker.service.dtos.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class SearchRequest {
    private String destination;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfGuests;
    private Integer numberOfRooms;
    private List<String> propertyTypes; // Loại chỗ nghỉ
    private Double minPrice; // Khoảng giá từ
    private Double maxPrice; // Khoảng giá đến
    private Integer minStarRating; // Số sao từ
    private Integer maxStarRating; // Số sao đến
    private Double minReviewScore; // Đánh giá từ
    private List<String> amenities; // Tiện nghi
    private Double maxDistanceFromCenter; // Khoảng cách trung tâm tối đa
    private Boolean breakfastIncluded; // Bữa sáng
    private Boolean freeCancellation; // Hủy miễn phí
    private Boolean payAtHotel; // Thanh toán tại chỗ
    private String sort; // RECOMMENDED, PRICE_LOW_TO_HIGH, PRICE_HIGH_TO_LOW, RATING
    private Integer adults;
    private Integer children;
    private Integer rooms;
}