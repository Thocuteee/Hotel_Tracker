package com.hoteltracker.service.dtos.response;

import com.hoteltracker.service.model.enums.RoomBookingStatus;
import com.hoteltracker.service.model.enums.CleaningStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RoomResponse {
    private Integer id;
    private String roomNumber;
    private RoomTypeResponse roomType; 
    private RoomBookingStatus bookingStatus;
    private CleaningStatus cleaningStatus;
    private String notes;
    private Integer floor;
}