package com.hoteltracker.service.controller;

import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.services.PublicService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hoteltracker.service.dtos.request.SearchRequest;
import com.hoteltracker.service.dtos.response.HotelCardResponse;
import com.hoteltracker.service.dtos.response.HotelDetailResponse;

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

    @GetMapping("/search-hotels")
    public ResponseEntity<List<HotelCardResponse>> searchHotels(
            @RequestParam String destination,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false, defaultValue = "1") Integer numberOfGuests,
            @RequestParam(required = false, defaultValue = "1") Integer numberOfRooms) {
        
        SearchRequest searchRequest = new SearchRequest();
        searchRequest.setDestination(destination);
        searchRequest.setCheckInDate(checkInDate);
        searchRequest.setCheckOutDate(checkOutDate);
        searchRequest.setNumberOfGuests(numberOfGuests);
        searchRequest.setNumberOfRooms(numberOfRooms);

        return ResponseEntity.ok(publicService.searchHotels(searchRequest));
    }

    @GetMapping("/hotels/{branchId}")
    public ResponseEntity<HotelDetailResponse> getHotelDetails(
            @PathVariable Integer branchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate) {
        
        HotelDetailResponse hotelDetail = publicService.getHotelDetails(branchId, checkInDate, checkOutDate);
        if (hotelDetail == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(hotelDetail);
    }
}
