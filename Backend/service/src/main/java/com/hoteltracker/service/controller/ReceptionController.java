package com.hoteltracker.service.controller;

import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.services.ReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/reception")
@RequiredArgsConstructor
public class ReceptionController {

    private final ReceptionService receptionService;

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getBookingsByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(receptionService.getBookingsByDate(date));
    }

    @GetMapping("/available-rooms")
    public ResponseEntity<List<RoomResponse>> getAvailableRoomsByRoomType(
            @RequestParam Integer roomTypeId) {
        return ResponseEntity.ok(receptionService.getAvailableRoomsByRoomType(roomTypeId));
    }

    @PostMapping("/check-in")
    public ResponseEntity<BookingResponse> checkIn(
            @RequestParam Integer bookingId,
            @RequestParam Integer roomId) {
        return ResponseEntity.ok(receptionService.checkIn(bookingId, roomId));
    }

    @PostMapping("/check-out")
    public ResponseEntity<BookingResponse> checkOut(
            @RequestParam Integer bookingId) {
        return ResponseEntity.ok(receptionService.checkOut(bookingId));
    }
}
