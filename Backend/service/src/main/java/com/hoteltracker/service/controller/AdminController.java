package com.hoteltracker.service.controller;

import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.model.enums.BookingStatus;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {
        private final BookingRepository bookingRepository;
        private final RoomRepository roomRepository;

        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getDashboardStats() {
                LocalDate today = LocalDate.now();
                List<Booking> allBookings = bookingRepository.findAll();
                
                double todayRevenue = allBookings.stream()
                        .filter(b -> (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT))
                        .filter(b -> b.getCheckInDate().equals(today) || b.getCheckOutDate().equals(today) || (b.getCheckInDate().isBefore(today) && b.getCheckOutDate().isAfter(today)))
                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice().doubleValue() : 0.0)
                        .sum();
                        
                double totalRevenue = allBookings.stream()
                        .filter(b -> (b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.CHECKED_IN || b.getStatus() == BookingStatus.CHECKED_OUT))
                        .mapToDouble(b -> b.getTotalPrice() != null ? b.getTotalPrice().doubleValue() : 0.0)
                        .sum();

                long totalRooms = roomRepository.count();
                long occupiedRoomsCount = allBookings.stream()
                        .filter(b -> (b.getStatus() == BookingStatus.CHECKED_IN) || 
                                (b.getStatus() == BookingStatus.CONFIRMED && b.getCheckInDate().equals(today)))
                        .count();

                double occupancyRate = totalRooms > 0 ? ((double) occupiedRoomsCount / totalRooms) * 100 : 0;

                Map<String, Object> stats = new HashMap<>();
                stats.put("todayRevenue", todayRevenue);
                stats.put("totalRevenue", totalRevenue);
                stats.put("occupancyRate", Math.round(occupancyRate * 100.0) / 100.0);
                stats.put("totalBookings", allBookings.size());
                stats.put("totalRooms", totalRooms);

                return ResponseEntity.ok(stats);
        }
}
