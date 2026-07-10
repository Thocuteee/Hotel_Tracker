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

    @GetMapping("/search-properties")
    public ResponseEntity<List<HotelCardResponse>> searchProperties(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkInDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOutDate,
            @RequestParam(required = false, defaultValue = "1") Integer adults,
            @RequestParam(required = false, defaultValue = "0") Integer children,
            @RequestParam(required = false, defaultValue = "1") Integer rooms,
            @RequestParam(required = false) List<String> propertyTypes,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minStarRating,
            @RequestParam(required = false) Integer maxStarRating,
            @RequestParam(required = false) Double minReviewScore,
            @RequestParam(required = false) List<String> amenities,
            @RequestParam(required = false) String sort) {
        
        SearchRequest searchRequest = new SearchRequest();
        searchRequest.setDestination(destination);
        searchRequest.setCheckInDate(checkInDate != null ? checkInDate : LocalDate.now());
        searchRequest.setCheckOutDate(checkOutDate != null ? checkOutDate : LocalDate.now().plusDays(1));
        searchRequest.setAdults(adults);
        searchRequest.setChildren(children);
        searchRequest.setRooms(rooms);
        searchRequest.setPropertyTypes(propertyTypes);
        searchRequest.setMinPrice(minPrice);
        searchRequest.setMaxPrice(maxPrice);
        searchRequest.setMinStarRating(minStarRating);
        searchRequest.setMaxStarRating(maxStarRating);
        searchRequest.setMinReviewScore(minReviewScore);
        searchRequest.setAmenities(amenities);
        searchRequest.setSort(sort != null ? sort : "RECOMMENDED");

        return ResponseEntity.ok(publicService.searchProperties(searchRequest));
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
