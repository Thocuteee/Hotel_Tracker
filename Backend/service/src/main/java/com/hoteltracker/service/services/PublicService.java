package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.SearchRequest;
import com.hoteltracker.service.dtos.response.HotelCardResponse;
import com.hoteltracker.service.dtos.response.HotelDetailResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;

import java.time.LocalDate;
import java.util.List;

public interface PublicService {
    List<RoomTypeResponse> getRecommendedRoomTypes();
    List<RoomTypeResponse> searchRoomTypes(Integer branchId, LocalDate checkInDate, LocalDate checkOutDate);
    List<HotelCardResponse> searchProperties(SearchRequest searchRequest);
    HotelDetailResponse getHotelDetails(Integer branchId, LocalDate checkInDate, LocalDate checkOutDate);
}
