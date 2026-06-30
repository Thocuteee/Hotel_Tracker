package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.MaintenanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Integer> {
    List<MaintenanceLog> findByRoomId(Integer roomId);
    List<MaintenanceLog> findByStaffId(Integer staffId);
}