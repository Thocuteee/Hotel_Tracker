package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomTypeDetailResponse;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.model.RoomType;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class RoomTypeMapper {

    public RoomTypeResponse toResponse(RoomType roomType) {
        if (roomType == null) {
            return null;
        }
        return RoomTypeResponse.builder()
                .id(roomType.getId())
                .name(roomType.getName())
                .basePrice(roomType.getBasePrice())
                .capacity(roomType.getCapacity())
                .description(roomType.getDescription())
                .images(roomType.getImages())
                .discount(roomType.getDiscount())
                .discountStart(roomType.getDiscountStart())
                .discountEnd(roomType.getDiscountEnd())
                .isFeatured(roomType.getIsFeatured())
                .isPublic(roomType.getIsPublic())
                .status(roomType.getStatus() != null ? roomType.getStatus().name() : null)
                .cancellationPolicy(roomType.getCancellationPolicy())
                .checkInTime(roomType.getCheckInTime())
                .checkOutTime(roomType.getCheckOutTime())
                .allowSmoking(roomType.getAllowSmoking())
                .allowPets(roomType.getAllowPets())
                .extraBedAllowed(roomType.getExtraBedAllowed())
                .branchId(roomType.getBranch() != null ? roomType.getBranch().getId() : null)
                .build();
    }

    public RoomTypeDetailResponse toRoomTypeDetailResponse(RoomType roomType) {
        if (roomType == null) {
            return null;
        }
        RoomTypeDetailResponse response = new RoomTypeDetailResponse();
        response.setId(roomType.getId());
        response.setName(roomType.getName());
        response.setDescription(roomType.getDescription());
        response.setImages(roomType.getImages());
        // price và availableRooms sẽ được set trong service dựa trên ngày tìm kiếm
        response.setCapacity(roomType.getCapacity());
        response.setSize(roomType.getRoomSize()); // Sử dụng trường roomSize mới
        // amenities sẽ được xử lý riêng nếu có entity ServiceItem liên kết với RoomType
        response.setAmenities(Collections.emptyList()); 
        response.setBreakfastIncluded(roomType.getBreakfastIncluded()); // Sử dụng trường mới
        response.setFreeCancellation(roomType.getCancellationPolicy() != null && roomType.getCancellationPolicy().toLowerCase().contains("miễn phí"));
        return response;
    }

    public RoomType toEntity(RoomTypeRequest request) {
        if (request == null) {
            return null;
        }
        return RoomType.builder()
                .name(request.getName())
                .basePrice(request.getBasePrice())
                .capacity(request.getCapacity())
                .description(request.getDescription())
                .images(request.getImages())
                .discount(request.getDiscount() != null ? request.getDiscount() : 0)
                .discountStart(request.getDiscountStart())
                .discountEnd(request.getDiscountEnd())
                .isFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .status(request.getStatus() != null ? com.hoteltracker.service.model.enums.RoomTypeStatus.valueOf(request.getStatus()) : com.hoteltracker.service.model.enums.RoomTypeStatus.AVAILABLE)
                .cancellationPolicy(request.getCancellationPolicy())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .allowSmoking(request.getAllowSmoking() != null ? request.getAllowSmoking() : false)
                .allowPets(request.getAllowPets() != null ? request.getAllowPets() : false)
                .extraBedAllowed(request.getExtraBedAllowed() != null ? request.getExtraBedAllowed() : false)
                .build();
    }
}