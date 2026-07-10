package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;
import com.hoteltracker.service.dtos.response.HotelCardResponse;
import com.hoteltracker.service.dtos.response.HotelDetailResponse;
import com.hoteltracker.service.model.Branch;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class BranchMapper {

    public BranchResponse toResponse(Branch branch) {
        if (branch == null) {
            return null;
        }
        return BranchResponse.builder()
                .id(branch.getId())
                .name(branch.getName())
                .address(branch.getAddress())
                .phone(branch.getPhone())
                .description(branch.getDescription())
                .imageUrl(branch.getImageUrl())
                .build();
    }

    public HotelCardResponse toHotelCardResponse(Branch branch) {
        if (branch == null) {
            return null;
        }
        HotelCardResponse response = new HotelCardResponse();
        response.setId(branch.getId());
        response.setName(branch.getName());
        response.setAddress(branch.getAddress());
        response.setImageUrl(branch.getImageUrl());
        // Các trường khác như starRating, reviewScore, lowestPriceAvailable... sẽ được set trong service
        return response;
    }
    
    public HotelDetailResponse toHotelDetailResponse(Branch branch) {
        if (branch == null) {
            return null;
        }
        HotelDetailResponse response = new HotelDetailResponse();
        response.setId(branch.getId());
        response.setName(branch.getName());
        response.setAddress(branch.getAddress());
        response.setLatitude(branch.getLatitude());
        response.setLongitude(branch.getLongitude());
        response.setPhone(branch.getPhone());
        response.setDescription(branch.getDescription());
        response.setImageUrl(branch.getImageUrl());
        // Giả sử galleryImages được lưu dưới dạng JSON trong một trường nào đó hoặc cần logic riêng
        response.setGalleryImages(Collections.emptyList()); 
        // roomTypes sẽ được set trong service
        response.setRoomTypes(Collections.emptyList());
        return response;
    }

    public Branch toEntity(BranchRequest request) {
        if (request == null) {
            return null;
        }
        return Branch.builder()
                .name(request.getName())
                .address(request.getAddress())
                .phone(request.getPhone())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();
    }
}
