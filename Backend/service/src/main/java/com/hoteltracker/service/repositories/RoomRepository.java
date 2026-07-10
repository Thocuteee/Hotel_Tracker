package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.Room;
import com.hoteltracker.service.model.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {
    Optional<Room> findByRoomNumber(String roomNumber);
    boolean existsByRoomNumber(String roomNumber);
    List<Room> findByRoomTypeId(Integer roomTypeId);
    List<Room> findByStatus(RoomStatus status);
    List<Room> findByRoomTypeIdAndStatus(Integer roomTypeId, RoomStatus status);
    long countByRoomTypeId(Integer roomTypeId);

    @Query("SELECT COUNT(r) FROM Room r WHERE r.roomType.id = :roomTypeId AND r.status = 'AVAILABLE' AND r.id NOT IN (" +
            "SELECT b.room.id FROM Booking b " +
            "WHERE b.roomType.id = :roomTypeId AND b.room IS NOT NULL AND " +
            "b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN') AND " +
            "((b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate) OR " +
            "(b.checkInDate = :checkInDate AND b.checkOutDate = :checkOutDate)))")
    long countAvailableRoomsByRoomTypeIdAndDates(
            @Param("roomTypeId") Integer roomTypeId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate);
}
