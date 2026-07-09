package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.response.RoomTypeResponse;

import java.time.LocalDate;
import java.util.List;

public interface PublicService {
    List<RoomTypeResponse> getRecommendedRoomTypes();
    List<RoomTypeResponse> searchRoomTypes(Integer branchId, LocalDate checkInDate, LocalDate checkOutDate);
}
