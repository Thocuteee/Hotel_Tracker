package com.hoteltracker.service.dtos.response;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class HotelCardResponse {
    private Integer id;
    private String name;
    private String address;
    private Integer starRating; // Giả sử Branch có starRating hoặc tính toán từ RoomType
    private Double distanceFromCenter; // Cần tính toán hoặc giả định
    private Double reviewScore; // Cần tính toán hoặc giả định
    private List<String> highlightedAmenities; // Tiện nghi nổi bật
    private BigDecimal lowestPriceAvailable; // Giá thấp nhất của một hạng phòng còn trống
    private Integer availableRoomCount;
    private String availableRoomsMessage; // Ví dụ: "Còn 3 phòng" hoặc "Hết phòng"
    private String imageUrl; // Ảnh đại diện của khách sạn
}