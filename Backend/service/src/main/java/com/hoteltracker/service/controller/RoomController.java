package com.hoteltracker.service.controller;

import com.hoteltracker.service.dtos.request.RoomRequest;
import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.model.enums.RoomBookingStatus;
import com.hoteltracker.service.model.enums.CleaningStatus;
import com.hoteltracker.service.services.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @PostMapping("/room-types")
    public ResponseEntity<RoomTypeResponse> createRoomType(@Valid @RequestBody RoomTypeRequest request) {
        return new ResponseEntity<>(roomService.createRoomType(request), HttpStatus.CREATED);
    }

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomTypeResponse>> getAllRoomTypes() {
        return ResponseEntity.ok(roomService.getAllRoomTypes());
    }

    @GetMapping("/room-types/{id}")
    public ResponseEntity<RoomTypeResponse> getRoomTypeById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomTypeById(id));
    }

    @PutMapping("/room-types/{id}")
    public ResponseEntity<RoomTypeResponse> updateRoomType(@PathVariable Integer id, @Valid @RequestBody RoomTypeRequest request) {
        return ResponseEntity.ok(roomService.updateRoomType(id, request));
    }

    @DeleteMapping("/room-types/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Integer id) {
        roomService.deleteRoomType(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rooms")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return new ResponseEntity<>(roomService.createRoom(request), HttpStatus.CREATED);
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponse>> getRooms(
            @RequestParam(required = false) Integer roomTypeId,
            @RequestParam(required = false) RoomBookingStatus bookingStatus,
            @RequestParam(required = false) CleaningStatus cleaningStatus) {
        return ResponseEntity.ok(roomService.getRooms(roomTypeId, bookingStatus, cleaningStatus));
    }

    @PutMapping("/rooms/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Integer id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Integer id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}