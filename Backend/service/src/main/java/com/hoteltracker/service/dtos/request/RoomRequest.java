package com.hoteltracker.service.dtos.request;

import com.hoteltracker.service.model.enums.RoomStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequest {
    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    @NotNull(message = "ID Loại phòng không được để trống")
    private Integer roomTypeId;

    @NotNull(message = "Trạng thái phòng không được để trống")
    private RoomStatus status;

    @NotNull(message = "Tầng không được để trống")
    private Integer floor;
}
