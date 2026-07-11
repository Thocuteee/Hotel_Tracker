package com.hoteltracker.service.controller;

import com.hoteltracker.service.model.Amenity;
import com.hoteltracker.service.repositories.AmenityRepository;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/amenities")
@RequiredArgsConstructor
public class AmenityController {

    private final AmenityRepository amenityRepository;

    @GetMapping
    public ResponseEntity<List<Amenity>> getAllAmenities() {
        return ResponseEntity.ok(amenityRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Amenity> createAmenity(@RequestBody Amenity amenity) {
        if (amenityRepository.findByName(amenity.getName()).isPresent()) {
            throw new IllegalArgumentException("Tiện nghi này đã tồn tại!");
        }
        return new ResponseEntity<>(amenityRepository.save(amenity), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Amenity> updateAmenity(@PathVariable Integer id, @RequestBody Amenity amenityData) {
        Amenity existing = amenityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tiện nghi với ID: " + id));
        
        existing.setName(amenityData.getName());
        existing.setIcon(amenityData.getIcon());
        return ResponseEntity.ok(amenityRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAmenity(@PathVariable Integer id) {
        if (!amenityRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy tiện nghi với ID: " + id);
        }
        amenityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
