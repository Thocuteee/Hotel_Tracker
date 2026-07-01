package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.request.RoomRequest;
import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.exceptions.DuplicateResourceException;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.mappers.RoomMapper;
import com.hoteltracker.service.mappers.RoomTypeMapper;
import com.hoteltracker.service.model.Room;
import com.hoteltracker.service.model.RoomType;
import com.hoteltracker.service.model.enums.RoomStatus;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.repositories.RoomTypeRepository;
import com.hoteltracker.service.services.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeMapper roomTypeMapper;
    private final RoomMapper roomMapper;

    @Override
    public RoomTypeResponse createRoomType(RoomTypeRequest request) {
        if (roomTypeRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Tên loại phòng đã tồn tại!");
        }
        RoomType roomType = roomTypeMapper.toEntity(request);
        return roomTypeMapper.toResponse(roomTypeRepository.save(roomType));
    }

    @Override
    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(roomTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoomResponse createRoom(RoomRequest request) {
        if (roomRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new DuplicateResourceException("Số phòng này đã tồn tại!");
        }
        
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Loại phòng với ID: " + request.getRoomTypeId()));

        Room room = roomMapper.toEntity(request);
        room.setRoomType(roomType);
        
        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override
    public RoomResponse getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng với ID: " + id));
        return roomMapper.toResponse(room);
    }

    @Override
    public List<RoomResponse> getRooms(Integer roomTypeId, RoomStatus status) {
        List<Room> rooms;
        if (roomTypeId != null && status != null) {
            rooms = roomRepository.findByRoomTypeIdAndStatus(roomTypeId, status);
        } else if (roomTypeId != null) {
            rooms = roomRepository.findByRoomTypeId(roomTypeId);
        } else if (status != null) {
            rooms = roomRepository.findByStatus(status);
        } else {
            rooms = roomRepository.findAll();
        }
        
        return rooms.stream().map(roomMapper::toResponse).collect(Collectors.toList());
    }
}