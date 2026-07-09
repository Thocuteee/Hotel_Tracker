package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.time.LocalDate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCustomerId(Integer customerId);
    List<Booking> findByRoomId(Integer roomId);
    List<Booking> findByStatus(BookingStatus status);

    @Query(
        "SELECT count(b) FROM Booking b WHERE b.roomType.id = :roomTypeId " +
        "AND b.status IN ('PENDING', 'CONFIRMED', 'CHECKED_IN') " +
        "AND (b.checkInDate < :checkOutDate AND b.checkOutDate > :checkInDate)"
    )
    long countOverlappingBookings(
        @Param("roomTypeId") Integer roomTypeId,
        @Param("checkInDate") LocalDate checkInDate,
        @Param("checkOutDate") LocalDate checkOutDate
    );
}