package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;
import com.hoteltracker.service.dtos.response.HotelCardResponse;
import com.hoteltracker.service.dtos.response.HotelDetailResponse;
import com.hoteltracker.service.model.Branch;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.Collections;
import java.util.List;

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
                .propertyType(branch.getPropertyType() != null ? branch.getPropertyType().name() : "HOTEL")
                .status(branch.getStatus() != null ? branch.getStatus().name() : "ACTIVE")
                .starRating(branch.getStarRating() != null ? branch.getStarRating() : 4)
                .email(branch.getEmail())
                .checkInTime(branch.getCheckInTime() != null ? branch.getCheckInTime() : "14:00")
                .checkOutTime(branch.getCheckOutTime() != null ? branch.getCheckOutTime() : "12:00")
                .latitude(branch.getLatitude())
                .longitude(branch.getLongitude())
                .website(branch.getWebsite())
                .slug(branch.getSlug())
                .galleryImages(branch.getGalleryImages())
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
        response.setStarRating(branch.getStarRating() != null ? branch.getStarRating() : 4);
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
        response.setEmail(branch.getEmail());
        response.setCheckInTime(branch.getCheckInTime() != null ? branch.getCheckInTime() : "14:00");
        response.setCheckOutTime(branch.getCheckOutTime() != null ? branch.getCheckOutTime() : "12:00");
        response.setStarRating(branch.getStarRating() != null ? branch.getStarRating() : 4);
        
        // Parse galleryImages JSON array
        if (branch.getGalleryImages() != null && !branch.getGalleryImages().trim().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                List<String> list = mapper.readValue(branch.getGalleryImages(), new TypeReference<List<String>>(){});
                response.setGalleryImages(list);
            } catch (Exception e) {
                response.setGalleryImages(Collections.singletonList(branch.getImageUrl()));
            }
        } else {
            response.setGalleryImages(Collections.singletonList(branch.getImageUrl()));
        }

        // roomTypes sẽ được set trong service
        response.setRoomTypes(Collections.emptyList());
        response.setWebsite(branch.getWebsite());
        response.setSlug(branch.getSlug());
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
                .propertyType(request.getPropertyType() != null ? com.hoteltracker.service.model.enums.PropertyType.valueOf(request.getPropertyType()) : com.hoteltracker.service.model.enums.PropertyType.HOTEL)
                .status(request.getStatus() != null ? com.hoteltracker.service.model.enums.BranchStatus.valueOf(request.getStatus()) : com.hoteltracker.service.model.enums.BranchStatus.ACTIVE)
                .starRating(request.getStarRating())
                .email(request.getEmail())
                .checkInTime(request.getCheckInTime() != null ? request.getCheckInTime() : "14:00")
                .checkOutTime(request.getCheckOutTime() != null ? request.getCheckOutTime() : "12:00")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .website(request.getWebsite())
                .slug(request.getSlug())
                .galleryImages(request.getGalleryImages())
                .build();
    }
}
