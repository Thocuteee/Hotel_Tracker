package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.BookingRequest;
import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.model.enums.BookingStatus;

import java.util.List;

public interface BookingService {
    BookingResponse createBooking(BookingRequest request);
    BookingResponse getBookingById(Integer id);
    List<BookingResponse> getBookingsByCustomerId(Integer customerId);
    List<BookingResponse> getAllBookings();
    BookingResponse updateStatus(Integer id, BookingStatus status);
    BookingResponse updateBooking(Integer id, BookingRequest request);
    void deleteBooking(Integer id);
}
