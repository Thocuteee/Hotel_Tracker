package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.request.SearchRequest;
import com.hoteltracker.service.dtos.response.HotelCardResponse;
import com.hoteltracker.service.dtos.response.HotelDetailResponse;
import com.hoteltracker.service.dtos.response.RoomTypeDetailResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.mappers.BranchMapper;
import com.hoteltracker.service.mappers.RoomTypeMapper;
import com.hoteltracker.service.model.Branch;
import com.hoteltracker.service.model.RoomType;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.BranchRepository;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.repositories.RoomTypeRepository;
import com.hoteltracker.service.services.PublicService;
import com.hoteltracker.service.services.RedisLockService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicServiceImpl implements PublicService {

    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final RedisLockService redisLockService;
    private final RoomTypeMapper roomTypeMapper;
    private final BranchRepository branchRepository; 
    private final BranchMapper branchMapper;         

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

    @Override
    public List<HotelCardResponse> searchHotels(SearchRequest searchRequest) {
        List<Branch> branches = branchRepository.findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(searchRequest.getDestination());
        List<HotelCardResponse> hotelCardResponses = new ArrayList<>();

        for (Branch branch : branches) {
            HotelCardResponse hotelCardResponse = branchMapper.toHotelCardResponse(branch);
            List<RoomType> roomTypes = roomTypeRepository.findByBranchId(branch.getId());

            BigDecimal lowestPriceAvailable = BigDecimal.ZERO;
            int totalAvailableRooms = 0;

            for (RoomType roomType : roomTypes) {
                // Filter room types by capacity
                if (roomType.getCapacity() < searchRequest.getNumberOfGuests()) {
                    continue;
                }

                long availableRooms = roomRepository.countAvailableRoomsByRoomTypeIdAndDates(
                        roomType.getId(),
                        searchRequest.getCheckInDate(),
                        searchRequest.getCheckOutDate()
                );
                
                long lockedSlots = redisLockService.countLockedSlots(roomType.getId());
                availableRooms -= lockedSlots;


                if (availableRooms > 0) {
                    BigDecimal currentPrice = roomType.getBasePrice();
                    if (lowestPriceAvailable.compareTo(BigDecimal.ZERO) == 0 || currentPrice.compareTo(lowestPriceAvailable) < 0) {
                        lowestPriceAvailable = currentPrice;
                    }
                    totalAvailableRooms += availableRooms;
                }
            }

            if (lowestPriceAvailable.compareTo(BigDecimal.ZERO) > 0) {
                hotelCardResponse.setLowestPriceAvailable(lowestPriceAvailable);
                hotelCardResponse.setAvailableRooms(totalAvailableRooms);
                hotelCardResponse.setStarRating(4); 
                hotelCardResponse.setReviewScore(8.5); 
                hotelCardResponses.add(hotelCardResponse);
            }
        }
        return hotelCardResponses;
    }

    @Override
    public HotelDetailResponse getHotelDetails(Integer branchId, LocalDate checkInDate, LocalDate checkOutDate) {
        Optional<Branch> branchOptional = branchRepository.findById(branchId);
        if (branchOptional.isEmpty()) {
            return null; 
        }

        Branch branch = branchOptional.get();
        HotelDetailResponse hotelDetailResponse = branchMapper.toHotelDetailResponse(branch);

        List<RoomType> roomTypes = roomTypeRepository.findByBranchId(branch.getId());
        List<RoomTypeDetailResponse> roomTypeDetailResponses = new ArrayList<>();

        for (RoomType roomType : roomTypes) {
            RoomTypeDetailResponse roomTypeDetailResponse = roomTypeMapper.toRoomTypeDetailResponse(roomType);

            long availableRooms = roomRepository.countAvailableRoomsByRoomTypeIdAndDates(
                    roomType.getId(),
                    checkInDate,
                    checkOutDate
            );
            long lockedSlots = redisLockService.countLockedSlots(roomType.getId());
            availableRooms -= lockedSlots;


            roomTypeDetailResponse.setPrice(roomType.getBasePrice()); // Sử dụng basePrice tạm thời
            roomTypeDetailResponse.setAvailableRooms((int) Math.max(0, availableRooms));
            roomTypeDetailResponses.add(roomTypeDetailResponse);
        }
        hotelDetailResponse.setRoomTypes(roomTypeDetailResponses);

        if (branch.getImageUrl() != null && !branch.getImageUrl().isEmpty()) {
            List<String> gallery = new ArrayList<>();
            gallery.add(branch.getImageUrl()); 
            hotelDetailResponse.setGalleryImages(gallery);
        }

        return hotelDetailResponse;
    }
}
