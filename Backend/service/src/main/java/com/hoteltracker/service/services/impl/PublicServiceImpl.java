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
import com.hoteltracker.service.repositories.ReviewRepository;
import com.hoteltracker.service.services.PublicService;
import com.hoteltracker.service.services.RedisLockService;

import java.util.Collections;

import com.hoteltracker.service.model.enums.BranchStatus;
import com.hoteltracker.service.model.enums.PropertyType;
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
    private final ReviewRepository reviewRepository;

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
    public List<HotelCardResponse> searchProperties(SearchRequest searchRequest) {
        List<Branch> branches = branchRepository.findAll();

        branches = branches.stream()
                .filter(b -> b.getStatus() == null || b.getStatus() == BranchStatus.ACTIVE)
                .collect(Collectors.toList());

        if (searchRequest.getPropertyTypes() != null && !searchRequest.getPropertyTypes().isEmpty()) {
            branches = branches.stream()
                    .filter(b -> {
                        PropertyType type = b.getPropertyType() != null ? b.getPropertyType() : PropertyType.HOTEL;
                        return searchRequest.getPropertyTypes().contains(type.name());
                    })
                    .collect(Collectors.toList());
        }

        if (searchRequest.getDestination() != null && !searchRequest.getDestination().trim().isEmpty()) {
            String dest = searchRequest.getDestination().trim().toLowerCase();
            branches = branches.stream()
                    .filter(b -> (b.getName() != null && b.getName().toLowerCase().contains(dest)) || 
                                 (b.getAddress() != null && b.getAddress().toLowerCase().contains(dest)))
                    .collect(Collectors.toList());
        }

        if (searchRequest.getMinStarRating() != null) {
            branches = branches.stream()
                    .filter(b -> b.getStarRating() != null && b.getStarRating() >= searchRequest.getMinStarRating())
                    .collect(Collectors.toList());
        }
        if (searchRequest.getMaxStarRating() != null) {
            branches = branches.stream()
                    .filter(b -> b.getStarRating() != null && b.getStarRating() <= searchRequest.getMaxStarRating())
                    .collect(Collectors.toList());
        }

        List<HotelCardResponse> results = new ArrayList<>();

        LocalDate checkIn = searchRequest.getCheckInDate() != null ? searchRequest.getCheckInDate() : LocalDate.now();
        LocalDate checkOut = searchRequest.getCheckOutDate() != null ? searchRequest.getCheckOutDate() : LocalDate.now().plusDays(1);
        int requiredGuests = searchRequest.getAdults() != null ? searchRequest.getAdults() : 1;

        for (Branch branch : branches) {
            List<RoomType> roomTypes = roomTypeRepository.findByBranchId(branch.getId());
            BigDecimal lowestAvailablePrice = null;
            int totalAvailableRoomCount = 0;

            for (RoomType rt : roomTypes) {
                if (rt.getCapacity() < requiredGuests) {
                    continue;
                }

                if (!Boolean.TRUE.equals(rt.getIsPublic())) {
                    continue;
                }

                long totalRooms = roomRepository.countByRoomTypeId(rt.getId());
                long overlappingBookings = bookingRepository.countOverlappingBookings(rt.getId(), checkIn, checkOut);
                long lockedSlots = redisLockService.countLockedSlots(rt.getId());
                long availableRooms = totalRooms - overlappingBookings - lockedSlots;

                if (availableRooms > 0) {
                    BigDecimal price = rt.getBasePrice();
                    if (rt.getDiscount() != null && rt.getDiscount() > 0) {
                        price = price.multiply(BigDecimal.valueOf(1.0 - (rt.getDiscount() / 100.0)));
                    }
                    if (lowestAvailablePrice == null || price.compareTo(lowestAvailablePrice) < 0) {
                        lowestAvailablePrice = price;
                    }
                    totalAvailableRoomCount += availableRooms;
                }
            }

            if (totalAvailableRoomCount > 0 && lowestAvailablePrice != null) {
                HotelCardResponse response = branchMapper.toHotelCardResponse(branch);
                response.setLowestPriceAvailable(lowestAvailablePrice);
                response.setAvailableRoomCount(totalAvailableRoomCount);
                response.setAvailableRoomsMessage("Chỉ còn " + totalAvailableRoomCount + " phòng trống");
                
                List<com.hoteltracker.service.model.Review> reviews = reviewRepository.findByBookingRoomTypeBranchId(branch.getId());
                if (!reviews.isEmpty()) {
                    double sum = reviews.stream().mapToDouble(com.hoteltracker.service.model.Review::getRating).sum();
                    response.setReviewScore(Math.round((sum / reviews.size()) * 10.0) / 10.0);
                } else {
                    response.setReviewScore(0.0); 
                }
                
                results.add(response);
            }
        }

        if (searchRequest.getSort() != null) {
            String sort = searchRequest.getSort().toUpperCase();
            if ("PRICE_LOW_TO_HIGH".equals(sort)) {
                results.sort((r1, r2) -> r1.getLowestPriceAvailable().compareTo(r2.getLowestPriceAvailable()));
            } else if ("PRICE_HIGH_TO_LOW".equals(sort)) {
                results.sort((r1, r2) -> r2.getLowestPriceAvailable().compareTo(r1.getLowestPriceAvailable()));
            } else if ("RATING".equals(sort)) {
                results.sort((r1, r2) -> Double.compare(r2.getReviewScore(), r1.getReviewScore()));
            }
        }

        return results;
    }

    @Override
    public HotelDetailResponse getHotelDetails(Integer branchId, LocalDate checkInDate, LocalDate checkOutDate) {
        Optional<Branch> branchOptional = branchRepository.findById(branchId);
        if (branchOptional.isEmpty()) {
            return null; 
        }

        Branch branch = branchOptional.get();
        HotelDetailResponse hotelDetailResponse = branchMapper.toHotelDetailResponse(branch);

        if (branch.getAmenities() != null) {
            hotelDetailResponse.setAmenities(branch.getAmenities().stream()
                    .map(com.hoteltracker.service.model.Amenity::getName)
                    .collect(Collectors.toList()));
        } else {
            hotelDetailResponse.setAmenities(Collections.emptyList());
        }

        if (branch.getServices() != null) {
            hotelDetailResponse.setServices(new ArrayList<>(branch.getServices()));
        } else {
            hotelDetailResponse.setServices(Collections.emptyList());
        }

        List<com.hoteltracker.service.model.Review> reviews = reviewRepository.findByBookingRoomTypeBranchId(branch.getId());
        if (!reviews.isEmpty()) {
            double sum = reviews.stream().mapToDouble(com.hoteltracker.service.model.Review::getRating).sum();
            hotelDetailResponse.setReviewScore(Math.round((sum / reviews.size()) * 10.0) / 10.0);
        } else {
            hotelDetailResponse.setReviewScore(0.0);
        }

        List<RoomType> roomTypes = roomTypeRepository.findByBranchId(branch.getId());
        List<RoomTypeDetailResponse> roomTypeDetailResponses = new ArrayList<>();

        for (RoomType roomType : roomTypes) {
            if (!Boolean.TRUE.equals(roomType.getIsPublic())) {
                continue;
            }
            RoomTypeDetailResponse roomTypeDetailResponse = roomTypeMapper.toRoomTypeDetailResponse(roomType);

            long totalRooms = roomRepository.countByRoomTypeId(roomType.getId());
            long bookedRooms = bookingRepository.countOverlappingBookings(
                    roomType.getId(),
                    checkInDate != null ? checkInDate : LocalDate.now(),
                    checkOutDate != null ? checkOutDate : LocalDate.now().plusDays(1)
            );
            long availableRooms = totalRooms - bookedRooms;
            long lockedSlots = redisLockService.countLockedSlots(roomType.getId());
            availableRooms -= lockedSlots;

            BigDecimal price = roomType.getBasePrice();
            if (roomType.getDiscount() != null && roomType.getDiscount() > 0) {
                price = price.multiply(BigDecimal.valueOf(1.0 - (roomType.getDiscount() / 100.0)));
            }

            roomTypeDetailResponse.setPrice(price);
            roomTypeDetailResponse.setAvailableRoomCount((int) Math.max(0, availableRooms));
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
