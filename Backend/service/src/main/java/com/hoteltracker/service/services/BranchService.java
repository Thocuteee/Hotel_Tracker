package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;

import com.hoteltracker.service.model.ServiceItem;
import com.hoteltracker.service.model.Amenity;
import java.util.List;
import java.util.Set;

public interface BranchService {
    List<BranchResponse> getAllBranches();
    BranchResponse getBranchById(Integer id);
    BranchResponse createBranch(BranchRequest request);
    BranchResponse updateBranch(Integer id, BranchRequest request);
    BranchResponse updateGps(Integer id, Double lat, Double lng);
    void deleteBranch(Integer id);

    Set<ServiceItem> getBranchServices(Integer branchId);
    Set<ServiceItem> updateBranchServices(Integer branchId, List<Integer> serviceIds);

    Set<Amenity> getBranchAmenities(Integer branchId);
    Set<Amenity> updateBranchAmenities(Integer branchId, List<Integer> amenityIds);
}
