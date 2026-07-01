package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.RoomRequest;
import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.model.enums.RoomStatus;

import java.util.List;

public interface RoomService {
    RoomTypeResponse createRoomType(RoomTypeRequest request);
    List<RoomTypeResponse> getAllRoomTypes();
    
    RoomResponse createRoom(RoomRequest request);
    RoomResponse getRoomById(Integer id);
    List<RoomResponse> getRooms(Integer roomTypeId, RoomStatus status);
}