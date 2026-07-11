package com.hoteltracker.service.controller;

import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.model.enums.CleaningStatus;
import com.hoteltracker.service.services.RoomService;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.model.Room;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.mappers.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/housekeeping")
@RequiredArgsConstructor
public class HousekeepingController {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomResponse>> getRoomsToClean() {
        List<RoomResponse> rooms = roomRepository.findAll().stream()
                .filter(r -> r.getCleaningStatus() == CleaningStatus.DIRTY || r.getCleaningStatus() == CleaningStatus.CLEANING)
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(rooms);
    }

    @PatchMapping("/rooms/{roomId}/status")
    public ResponseEntity<RoomResponse> updateRoomStatus(
            @PathVariable Integer roomId,
            @RequestParam CleaningStatus status) {
        
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng ID: " + roomId));
        
        room.setCleaningStatus(status);
        Room savedRoom = roomRepository.save(room);
        RoomResponse response = roomMapper.toResponse(savedRoom);

        messagingTemplate.convertAndSend("/topic/room-status", response);

        return ResponseEntity.ok(response);
    }
}
