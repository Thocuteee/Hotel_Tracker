package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.RoomRequest;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.model.Room;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {

    @Autowired
    private RoomTypeMapper roomTypeMapper;

    public RoomResponse toResponse(Room room) {
        if (room == null) {
            return null;
        }
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .status(room.getStatus())
                .roomType(roomTypeMapper.toResponse(room.getRoomType()))
                .build();
    }

    public Room toEntity(RoomRequest request) {
        if (request == null) {
            return null;
        }
        return Room.builder()
                .roomNumber(request.getRoomNumber())
                .floor(request.getFloor())
                .status(request.getStatus())
                .build();
    }
}