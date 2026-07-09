package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.RoomTypeRequest;
import com.hoteltracker.service.dtos.response.RoomTypeResponse;
import com.hoteltracker.service.model.RoomType;
import org.springframework.stereotype.Component;

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
                .isRecommended(roomType.getIsRecommended())
                .branchId(roomType.getBranch() != null ? roomType.getBranch().getId() : null)
                .build();
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
                .isRecommended(request.getIsRecommended() != null ? request.getIsRecommended() : false)
                .build();
    }
}