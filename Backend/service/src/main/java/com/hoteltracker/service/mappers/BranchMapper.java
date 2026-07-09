package com.hoteltracker.service.mappers;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;
import com.hoteltracker.service.model.Branch;
import org.springframework.stereotype.Component;

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
