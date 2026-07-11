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

import com.hoteltracker.service.model.enums.PropertyType;
import com.hoteltracker.service.model.enums.BranchStatus;
import com.hoteltracker.service.model.ServiceItem;
import com.hoteltracker.service.model.Amenity;
import com.hoteltracker.service.repositories.ServiceItemRepository;
import com.hoteltracker.service.repositories.AmenityRepository;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchServiceImpl implements BranchService {

    private final BranchRepository branchRepository;
    private final BranchMapper branchMapper;
    private final ServiceItemRepository serviceItemRepository;
    private final AmenityRepository amenityRepository;

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
        branch.setPropertyType(request.getPropertyType() != null ? PropertyType.valueOf(request.getPropertyType()) : PropertyType.HOTEL);
        branch.setStatus(request.getStatus() != null ? BranchStatus.valueOf(request.getStatus()) : BranchStatus.ACTIVE);
        branch.setStarRating(request.getStarRating());
        branch.setEmail(request.getEmail());
        branch.setCheckInTime(request.getCheckInTime() != null ? request.getCheckInTime() : "14:00");
        branch.setCheckOutTime(request.getCheckOutTime() != null ? request.getCheckOutTime() : "12:00");
        branch.setLatitude(request.getLatitude());
        branch.setLongitude(request.getLongitude());
        branch.setWebsite(request.getWebsite());
        branch.setSlug(request.getSlug());
        branch.setGalleryImages(request.getGalleryImages());

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

    @Override
    @Transactional(readOnly = true)
    public Set<ServiceItem> getBranchServices(Integer branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + branchId));
        return branch.getServices() != null ? branch.getServices() : new HashSet<>();
    }

    @Override
    @Transactional
    public Set<ServiceItem> updateBranchServices(Integer branchId, List<Integer> serviceIds) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + branchId));
        List<ServiceItem> services = serviceItemRepository.findAllById(serviceIds);
        branch.setServices(new HashSet<>(services));
        return branchRepository.save(branch).getServices();
    }

    @Override
    @Transactional(readOnly = true)
    public Set<Amenity> getBranchAmenities(Integer branchId) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + branchId));
        return branch.getAmenities() != null ? branch.getAmenities() : new HashSet<>();
    }

    @Override
    @Transactional
    public Set<Amenity> updateBranchAmenities(Integer branchId, List<Integer> amenityIds) {
        Branch branch = branchRepository.findById(branchId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + branchId));
        List<Amenity> amenities = amenityRepository.findAllById(amenityIds);
        branch.setAmenities(new HashSet<>(amenities));
        return branchRepository.save(branch).getAmenities();
    }
}
