package com.hoteltracker.service.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LockRoomRequest {
    @NotNull
    private Integer roomTypeId;
    @NotNull
    private LocalDate checkInDate;
    @NotNull
    private LocalDate checkOutDate;
}
