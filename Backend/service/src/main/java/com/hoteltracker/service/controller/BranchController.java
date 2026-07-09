package com.hoteltracker.service.controller;

import com.hoteltracker.service.dtos.request.BranchRequest;
import com.hoteltracker.service.dtos.response.BranchResponse;
import com.hoteltracker.service.services.BranchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/branches")
@RequiredArgsConstructor
public class BranchController {

    private final BranchService branchService;

    @GetMapping
    public ResponseEntity<List<BranchResponse>> getAllBranches() {
        return ResponseEntity.ok(branchService.getAllBranches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BranchResponse> getBranchById(@PathVariable Integer id) {
        return ResponseEntity.ok(branchService.getBranchById(id));
    }

    @PatchMapping("/{id}/gps")
    public ResponseEntity<BranchResponse> updateGps(@PathVariable Integer id, @RequestParam Double lat, @RequestParam Double lng) {
        return ResponseEntity.ok(branchService.updateGps(id, lat, lng));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchResponse> createBranch(@Valid @RequestBody BranchRequest request) {
        return new ResponseEntity<>(branchService.createBranch(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BranchResponse> updateBranch(
            @PathVariable Integer id,
            @Valid @RequestBody BranchRequest request) {
        return ResponseEntity.ok(branchService.updateBranch(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBranch(@PathVariable Integer id) {
        branchService.deleteBranch(id);
        return ResponseEntity.noContent().build();
    }
}
