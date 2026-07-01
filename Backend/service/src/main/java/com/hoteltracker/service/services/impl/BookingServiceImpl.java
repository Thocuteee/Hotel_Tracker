package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.request.BookingRequest;
import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.exceptions.BadRequestException;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.mappers.BookingMapper;
import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.model.Room;
import com.hoteltracker.service.model.User;
import com.hoteltracker.service.model.enums.BookingStatus;
import com.hoteltracker.service.model.enums.RoomStatus;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.repositories.UserRepository;
import com.hoteltracker.service.services.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional 
    public BookingResponse createBooking(BookingRequest request) {
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) || 
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new BadRequestException("Ngày trả phòng phải sau ngày nhận phòng!");
        }

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Khách hàng"));
                
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng"));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException("Phòng này hiện không có sẵn để đặt!");
        }

        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal totalPrice = room.getRoomType().getBasePrice().multiply(BigDecimal.valueOf(days));

        Booking booking = bookingMapper.toEntity(request);
        booking.setCustomer(customer);
        booking.setRoom(room);
        booking.setStatus(BookingStatus.PENDING); 
        booking.setTotalPrice(totalPrice);
        room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse getBookingById(Integer id) {
        return bookingRepository.findById(id)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + id));
    }

    @Override
    public List<BookingResponse> getBookingsByCustomerId(Integer customerId) {
        return bookingRepository.findByCustomerId(customerId).stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateStatus(Integer id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + id));
        booking.setStatus(status);
        
        if (status == BookingStatus.CHECKED_OUT || status == BookingStatus.CANCELLED) {
            Room room = booking.getRoom();
            room.setStatus(status == BookingStatus.CHECKED_OUT ? RoomStatus.DIRTY : RoomStatus.AVAILABLE);
            roomRepository.save(room);
        }
        
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }
}