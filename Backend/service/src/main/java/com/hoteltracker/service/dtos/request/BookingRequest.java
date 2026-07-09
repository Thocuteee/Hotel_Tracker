package com.hoteltracker.service.dtos.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull(message = "ID khách hàng không được để trống")
    private Integer customerId;

    @NotNull(message = "ID Hạng phòng không được để trống")
    private Integer roomTypeId;

    private Integer roomId;

    @NotNull(message = "Ngày nhận phòng không được để trống")
    @FutureOrPresent(message = "Ngày nhận phòng phải ở hiện tại hoặc tương lai")
    private LocalDate checkInDate;

    @NotNull(message = "Ngày trả phòng không được để trống")
    private LocalDate checkOutDate;
    
    private Integer numAdults;
    private Integer numChildren;
    private String specialRequests;
}
