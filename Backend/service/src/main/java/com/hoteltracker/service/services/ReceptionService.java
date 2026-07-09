package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.dtos.response.RoomResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReceptionService {
    List<BookingResponse> getBookingsByDate(LocalDate date);
    List<RoomResponse> getAvailableRoomsByRoomType(Integer roomTypeId);
    BookingResponse checkIn(Integer bookingId, Integer roomId);
    BookingResponse checkOut(Integer bookingId);
}
