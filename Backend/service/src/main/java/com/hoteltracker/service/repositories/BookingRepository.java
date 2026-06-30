package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.model.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    List<Booking> findByCustomerId(Integer customerId);
    List<Booking> findByRoomId(Integer roomId);
    List<Booking> findByStatus(BookingStatus status);
}