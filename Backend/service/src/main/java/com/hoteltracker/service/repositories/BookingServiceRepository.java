package com.hoteltracker.service.repositories;

import com.hoteltracker.service.model.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingServiceRepository extends JpaRepository<BookingService, Integer> {
    List<BookingService> findByBookingId(Integer bookingId);
}
