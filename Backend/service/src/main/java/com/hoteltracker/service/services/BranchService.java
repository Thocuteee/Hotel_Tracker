package com.hoteltracker.service.services;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;

import java.util.List;

public interface BranchService {
    List<BranchResponse> getAllBranches();
    BranchResponse getBranchById(Integer id);
    BranchResponse createBranch(BranchRequest request);
    BranchResponse updateBranch(Integer id, BranchRequest request);
    BranchResponse updateGps(Integer id, Double lat, Double lng);
    void deleteBranch(Integer id);
}
