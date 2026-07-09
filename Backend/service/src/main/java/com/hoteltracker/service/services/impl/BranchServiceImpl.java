package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.mappers.BranchMapper;
import com.hoteltracker.service.model.Branch;
import com.hoteltracker.service.repositories.BranchRepository;
import com.hoteltracker.service.services.BranchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;

    @Override
    public List<BranchResponse> getAllBranches() {
        return branchRepository.findAll().stream()
                .map(branchMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BranchResponse getBranchById(Integer id) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));
        return branchMapper.toResponse(branch);
    }

    @Override
    @Transactional
    public BranchResponse createBranch(BranchRequest request) {
        if (branchRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tên chi nhánh đã tồn tại");
        }
        Branch branch = branchMapper.toEntity(request);
        Branch savedBranch = branchRepository.save(branch);
        return branchMapper.toResponse(savedBranch);
    }

    @Override
    @Transactional
    public BranchResponse updateBranch(Integer id, BranchRequest request) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));

        if (!branch.getName().equals(request.getName()) && branchRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tên chi nhánh đã tồn tại");
        }

        branch.setName(request.getName());
        branch.setAddress(request.getAddress());
        branch.setPhone(request.getPhone());
        branch.setDescription(request.getDescription());
        branch.setImageUrl(request.getImageUrl());

        Branch updatedBranch = branchRepository.save(branch);
        return branchMapper.toResponse(updatedBranch);
    }

    @Override
    @Transactional
    public BranchResponse updateGps(Integer id, Double lat, Double lng) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));
        branch.setLatitude(lat);
        branch.setLongitude(lng);
        Branch updatedBranch = branchRepository.save(branch);
        return branchMapper.toResponse(updatedBranch);
    }

    @Override
    @Transactional
    public void deleteBranch(Integer id) {
        if (!branchRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id);
        }
        branchRepository.deleteById(id);
    }
}
