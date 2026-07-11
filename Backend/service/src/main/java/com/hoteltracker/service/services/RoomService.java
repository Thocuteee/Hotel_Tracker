package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.RoomRequest;
import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.model.enums.RoomBookingStatus;
import com.hoteltracker.service.model.enums.CleaningStatus;

import java.util.List;

public interface RoomService {
    RoomTypeResponse createRoomType(RoomTypeRequest request);
    List<RoomTypeResponse> getAllRoomTypes();
    RoomTypeResponse getRoomTypeById(Integer id);
    RoomTypeResponse updateRoomType(Integer id, RoomTypeRequest request);
    void deleteRoomType(Integer id);

    RoomResponse createRoom(RoomRequest request);
    RoomResponse getRoomById(Integer id);
    List<RoomResponse> getRooms(Integer roomTypeId, RoomBookingStatus bookingStatus, CleaningStatus cleaningStatus);
    RoomResponse updateRoom(Integer id, RoomRequest request);
    void deleteRoom(Integer id);
}
