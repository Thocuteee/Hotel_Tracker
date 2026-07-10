package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    Optional<RoomType> findByNameAndBranchId(String name, Integer branchId);
    boolean existsByNameAndBranchId(String name, Integer branchId);

    List<RoomType> findByBranchId(Integer branchId);

    @Query("SELECT rt FROM RoomType rt WHERE rt.branch.id = :branchId AND rt.capacity >= :minCapacity AND rt.basePrice BETWEEN :minPrice AND :maxPrice")
    List<RoomType> findByBranchIdAndCapacityAndPriceRange(
            @Param("branchId") Integer branchId,
            @Param("minCapacity") Integer minCapacity,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}
