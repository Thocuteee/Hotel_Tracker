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
import com.hoteltracker.service.model.Branch;
import com.hoteltracker.service.repositories.BranchRepository;
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
    private final BranchRepository branchRepository;
    private final RoomTypeMapper roomTypeMapper;
    private final RoomMapper roomMapper;

    @Override
    public RoomTypeResponse createRoomType(RoomTypeRequest request) {
        if (roomTypeRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Tên loại phòng đã tồn tại!");
        }

        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Chi nhánh với ID: " + request.getBranchId()));

        RoomType roomType = roomTypeMapper.toEntity(request);
        roomType.setBranch(branch);

        return roomTypeMapper.toResponse(roomTypeRepository.save(roomType));
    }

    @Override
    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(roomTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RoomTypeResponse getRoomTypeById(Integer id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Loại phòng với ID: " + id));
        return roomTypeMapper.toResponse(roomType);
    }

    @Override
    public RoomTypeResponse updateRoomType(Integer id, RoomTypeRequest request) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Loại phòng với ID: " + id));
        
        Branch branch = branchRepository.findById(request.getBranchId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Chi nhánh với ID: " + request.getBranchId()));

        roomType.setName(request.getName());
        roomType.setBasePrice(request.getBasePrice());
        roomType.setCapacity(request.getCapacity());
        roomType.setDescription(request.getDescription());
        roomType.setImages(request.getImages());
        roomType.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0);
        roomType.setDiscountStart(request.getDiscountStart());
        roomType.setDiscountEnd(request.getDiscountEnd());
        roomType.setIsRecommended(request.getIsRecommended() != null ? request.getIsRecommended() : false);
        roomType.setBranch(branch);

        return roomTypeMapper.toResponse(roomTypeRepository.save(roomType));
    }

    @Override
    public void deleteRoomType(Integer id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy Loại phòng với ID: " + id);
        }
        roomTypeRepository.deleteById(id);
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

    @Override
    public RoomResponse updateRoom(Integer id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng với ID: " + id));

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Loại phòng với ID: " + request.getRoomTypeId()));
        
        room.setRoomNumber(request.getRoomNumber());
        room.setRoomType(roomType);
        room.setStatus(request.getStatus());

        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override
    public void deleteRoom(Integer id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy Phòng với ID: " + id);
        }
        roomRepository.deleteById(id);
    }
}
