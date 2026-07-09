package com.hoteltracker.service.dtos.response;

import com.hoteltracker.service.model.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Integer id;
    private UserResponse customer;
    private RoomTypeResponse roomType;
    private RoomResponse room;
    private String assignedRoomNumber;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private BookingStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
}