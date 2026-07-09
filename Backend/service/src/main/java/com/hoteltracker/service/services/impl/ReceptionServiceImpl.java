package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.dtos.response.BookingResponse;
import com.hoteltracker.service.dtos.response.RoomResponse;
import com.hoteltracker.service.exceptions.BadRequestException;
import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.mappers.BookingMapper;
import com.hoteltracker.service.mappers.RoomMapper;
import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.model.Room;
import com.hoteltracker.service.model.enums.BookingStatus;
import com.hoteltracker.service.model.enums.RoomStatus;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.services.ReceptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReceptionServiceImpl implements ReceptionService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final BookingMapper bookingMapper;
    private final RoomMapper roomMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<BookingResponse> getBookingsByDate(LocalDate date) {
        return bookingRepository.findAll().stream()
                .filter(b -> b.getCheckInDate().equals(date) || b.getCheckOutDate().equals(date) || (b.getCheckInDate().isBefore(date) && b.getCheckOutDate().isAfter(date)))
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoomResponse> getAvailableRoomsByRoomType(Integer roomTypeId) {
        return roomRepository.findByRoomTypeIdAndStatus(roomTypeId, RoomStatus.AVAILABLE).stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse checkIn(Integer bookingId, Integer roomId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking không ở trạng thái hợp lệ để Check-in!");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng vật lý ID: " + roomId));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException("Phòng này hiện không trống!");
        }

        if (!room.getRoomType().getId().equals(booking.getRoomType().getId())) {
            throw new BadRequestException("Phòng này không thuộc Hạng phòng mà khách đã đặt!");
        }

        booking.setRoom(room);
        booking.setStatus(BookingStatus.CHECKED_IN);
        
        room.setStatus(RoomStatus.OCCUPIED);
        Room savedRoom = roomRepository.save(room);

        messagingTemplate.convertAndSend("/topic/room-status", roomMapper.toResponse(savedRoom));

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public BookingResponse checkOut(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + bookingId));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new BadRequestException("Booking chưa được Check-in!");
        }

        Room room = booking.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.DIRTY);
            Room savedRoom = roomRepository.save(room);
            messagingTemplate.convertAndSend("/topic/room-status", roomMapper.toResponse(savedRoom));
        }

        booking.setStatus(BookingStatus.CHECKED_OUT);

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }
}
