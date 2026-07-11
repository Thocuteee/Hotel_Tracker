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
                .bookingStatus(room.getBookingStatus() != null ? room.getBookingStatus() : com.hoteltracker.service.model.enums.RoomBookingStatus.AVAILABLE)
                .cleaningStatus(room.getCleaningStatus() != null ? room.getCleaningStatus() : com.hoteltracker.service.model.enums.CleaningStatus.CLEAN)
                .notes(room.getNotes())
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
                .bookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : com.hoteltracker.service.model.enums.RoomBookingStatus.AVAILABLE)
                .cleaningStatus(request.getCleaningStatus() != null ? request.getCleaningStatus() : com.hoteltracker.service.model.enums.CleaningStatus.CLEAN)
                .notes(request.getNotes())
                .build();
    }
}