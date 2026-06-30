package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.PriceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceLogRepository extends JpaRepository<PriceLog, Integer> {
    List<PriceLog> findByRoomTypeId(Integer roomTypeId);
}