package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.BookingRequest;
import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RoomMapper roomMapper;

    @Autowired
    private RoomTypeMapper roomTypeMapper;

    public BookingResponse toResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
        return BookingResponse.builder()
                .id(booking.getId())
                .customer(userMapper.toResponse(booking.getCustomer()))
                .roomType(roomTypeMapper.toResponse(booking.getRoomType()))
                .room(booking.getRoom() != null ? roomMapper.toResponse(booking.getRoom()) : null)
                .assignedRoomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .status(booking.getStatus())
                .totalPrice(booking.getTotalPrice())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public Booking toEntity(BookingRequest request) {
        if (request == null) {
            return null;
        }
        return Booking.builder()
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .numAdults(request.getNumAdults())
                .numChildren(request.getNumChildren())
                .specialRequests(request.getSpecialRequests())
                .build();
    }
}