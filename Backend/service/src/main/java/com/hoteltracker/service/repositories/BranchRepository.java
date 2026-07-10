package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Integer> {
    Optional<Branch> findByName(String name);
    boolean existsByName(String name);

    @Query("SELECT b FROM Branch b WHERE LOWER(b.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(b.address) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Branch> findByNameContainingIgnoreCaseOrAddressContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}
