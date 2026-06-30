package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.Room;
import com.hoteltracker.service.model.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    List<Room> findByRoomTypeId(Integer roomTypeId);
    List<Room> findByStatus(RoomStatus status);
    List<Room> findByRoomTypeIdAndStatus(Integer roomTypeId, RoomStatus status);
}