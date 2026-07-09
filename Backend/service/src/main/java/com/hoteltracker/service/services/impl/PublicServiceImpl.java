package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.mappers.RoomTypeMapper;
import com.hoteltracker.service.model.RoomType;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.repositories.RoomTypeRepository;
import com.hoteltracker.service.services.PublicService;
import com.hoteltracker.service.services.RedisLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicServiceImpl implements PublicService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RedisLockService redisLockService;
    private final RoomTypeMapper roomTypeMapper;

    @Override
    public List<RoomTypeResponse> getRecommendedRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .filter(rt -> Boolean.TRUE.equals(rt.getIsPublic()) && Boolean.TRUE.equals(rt.getIsFeatured()))
                .map(roomTypeMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomTypeResponse> searchRoomTypes(Integer branchId, LocalDate checkInDate, LocalDate checkOutDate) {
        List<RoomType> roomTypes = roomTypeRepository.findAll().stream()
                .filter(rt -> Boolean.TRUE.equals(rt.getIsPublic()))
                .collect(Collectors.toList());
        if (branchId != null) {
            roomTypes = roomTypes.stream()
                    .filter(rt -> rt.getBranch() != null && rt.getBranch().getId().equals(branchId))
                    .collect(Collectors.toList());
        }

        return roomTypes.stream().map(rt -> {
            RoomTypeResponse response = roomTypeMapper.toResponse(rt);
            long totalRooms = roomRepository.countByRoomTypeId(rt.getId());
            long overlappingBookings = 0;
            if (checkInDate != null && checkOutDate != null) {
                overlappingBookings = bookingRepository.countOverlappingBookings(rt.getId(), checkInDate, checkOutDate);
            }
            long lockedSlots = redisLockService.countLockedSlots(rt.getId());
            long availableRooms = totalRooms - overlappingBookings - lockedSlots;
            response.setAvailableRooms((int) Math.max(0, availableRooms));
            return response;
        }).collect(Collectors.toList());
    }
}
