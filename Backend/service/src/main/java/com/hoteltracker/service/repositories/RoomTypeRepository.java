package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    Optional<RoomType> findByNameAndBranchId(String name, Integer branchId);
    boolean existsByNameAndBranchId(String name, Integer branchId);
}