package com.hoteltracker.service.controller;

import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.services.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicController {

    private final PublicService publicService;

    @GetMapping("/recommended-rooms")
    public ResponseEntity<List<RoomTypeResponse>> getRecommendedRoomTypes() {
        return ResponseEntity.ok(publicService.getRecommendedRoomTypes());
    }

    @GetMapping("/search-rooms")
    public ResponseEntity<List<RoomTypeResponse>> searchRoomTypes(
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        return ResponseEntity.ok(publicService.searchRoomTypes(branchId, checkInDate, checkOutDate));
    }
}
