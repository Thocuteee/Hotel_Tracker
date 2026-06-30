package com.hoteltracker.service.dtos.response;

import com.hoteltracker.service.model.enums.RoomStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private String roomNumber;
    private RoomTypeResponse roomType; 
    private RoomStatus status;
    private Integer floor;
}