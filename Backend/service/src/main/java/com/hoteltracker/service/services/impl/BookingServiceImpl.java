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
import com.hoteltracker.service.model.enums.RoomBookingStatus;
import com.hoteltracker.service.model.enums.CleaningStatus;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.repositories.RoomRepository;
import com.hoteltracker.service.repositories.UserRepository;
import com.hoteltracker.service.services.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import com.hoteltracker.service.repositories.RoomTypeRepository;
import com.hoteltracker.service.model.RoomType;
import com.hoteltracker.service.services.RedisLockService;
import com.hoteltracker.service.dtos.request.LockRoomRequest;
import com.hoteltracker.service.dtos.response.LockRoomResponse;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingMapper bookingMapper;
    private final RedisLockService redisLockService;

    @Override
    public LockRoomResponse lockRoom(LockRoomRequest request) {
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) || 
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new BadRequestException("Ngày trả phòng phải sau ngày nhận phòng!");
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Hạng phòng"));

        long totalRooms = roomRepository.countByRoomTypeId(roomType.getId());
        long overlappingBookings = bookingRepository.countOverlappingBookings(roomType.getId(), request.getCheckInDate(), request.getCheckOutDate());
        long lockedSlots = redisLockService.countLockedSlots(roomType.getId());

        if (totalRooms - overlappingBookings - lockedSlots <= 0) {
            throw new BadRequestException("Hạng phòng này đã hết chỗ trong khoảng thời gian đã chọn!");
        }

        String lockKey = UUID.randomUUID().toString();
        boolean locked = redisLockService.acquireLock(roomType.getId(), lockKey, 15);
        
        if (!locked) {
            throw new BadRequestException("Không thể giữ chỗ lúc này, vui lòng thử lại!");
        }

        return LockRoomResponse.builder()
                .lockKey(lockKey)
                .expirationMinutes(15L)
                .build();
    }

    @Override
    @Transactional 
    public BookingResponse createBooking(BookingRequest request, String lockKey) {
        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) || 
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new BadRequestException("Ngày trả phòng phải sau ngày nhận phòng!");
        }

        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Khách hàng"));
                
        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Hạng phòng"));

        long totalRooms = roomRepository.countByRoomTypeId(roomType.getId());
        long overlappingBookings = bookingRepository.countOverlappingBookings(roomType.getId(), request.getCheckInDate(), request.getCheckOutDate());
        
        if (lockKey == null || lockKey.isEmpty()) {
            long lockedSlots = redisLockService.countLockedSlots(roomType.getId());
            if (totalRooms - overlappingBookings - lockedSlots <= 0) {
                throw new BadRequestException("Hạng phòng này đã hết chỗ trong khoảng thời gian đã chọn!");
            }
        }

        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        
        BigDecimal pricePerNight = roomType.getBasePrice();
        if (roomType.getDiscount() != null && roomType.getDiscount() > 0 && roomType.getDiscountEnd() != null) {
            if (java.time.LocalDateTime.now().isBefore(roomType.getDiscountEnd())) {
                pricePerNight = pricePerNight.multiply(BigDecimal.valueOf(100 - roomType.getDiscount())).divide(BigDecimal.valueOf(100));
            }
        }
        
        BigDecimal totalPrice = pricePerNight.multiply(BigDecimal.valueOf(days));

        Booking booking = bookingMapper.toEntity(request);
        booking.setCustomer(customer);
        booking.setRoomType(roomType);
        
        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Phòng"));
            if (room.getBookingStatus() != RoomBookingStatus.AVAILABLE || room.getCleaningStatus() != CleaningStatus.CLEAN) {
                throw new BadRequestException("Phòng vật lý này không khả dụng hoặc chưa được dọn dẹp sạch sẽ!");
            }
            booking.setRoom(room);
            room.setBookingStatus(RoomBookingStatus.OCCUPIED);
            roomRepository.save(room);
            booking.setStatus(BookingStatus.CHECKED_IN);
        } else {
            booking.setStatus(BookingStatus.PENDING);
        }
        
        booking.setTotalPrice(totalPrice);

        Booking savedBooking = bookingRepository.save(booking);

        if (lockKey != null && !lockKey.isEmpty()) {
            redisLockService.releaseLock(roomType.getId(), lockKey);
        }

        return bookingMapper.toResponse(savedBooking);
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
        
        if (status == BookingStatus.CANCELLED) {
            if (booking.getStatus() == BookingStatus.CHECKED_IN || 
                booking.getStatus() == BookingStatus.CHECKED_OUT || 
                booking.getStatus() == BookingStatus.CANCELLED) {
                throw new BadRequestException("Không thể hủy đơn đặt phòng đang ở trạng thái: " + booking.getStatus());
            }
            if (booking.getStatus() == BookingStatus.CONFIRMED && !LocalDate.now().isBefore(booking.getCheckInDate())) {
                throw new BadRequestException("Chỉ được hủy đơn đặt phòng đã xác nhận trước ngày nhận phòng tối thiểu 24 giờ!");
            }
        }

        booking.setStatus(status);
        
        if (status == BookingStatus.CHECKED_OUT || status == BookingStatus.CANCELLED) {
            Room room = booking.getRoom();
            if (room != null) {
                if (status == BookingStatus.CHECKED_OUT) {
                    room.setBookingStatus(RoomBookingStatus.AVAILABLE);
                    room.setCleaningStatus(CleaningStatus.DIRTY);
                } else {
                    room.setBookingStatus(RoomBookingStatus.AVAILABLE);
                }
                roomRepository.save(room);
            }
        }
        
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(bookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse updateBooking(Integer id, BookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + id));

        if (request.getCheckOutDate().isBefore(request.getCheckInDate()) || 
            request.getCheckOutDate().isEqual(request.getCheckInDate())) {
            throw new BadRequestException("Ngày trả phòng phải sau ngày nhận phòng!");
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Hạng phòng"));

        booking.setCheckInDate(request.getCheckInDate());
        booking.setCheckOutDate(request.getCheckOutDate());
        booking.setNumAdults(request.getNumAdults());
        booking.setNumChildren(request.getNumChildren());
        booking.setSpecialRequests(request.getSpecialRequests());
        booking.setRoomType(roomType);

        long days = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        
        BigDecimal pricePerNight = roomType.getBasePrice();
        if (roomType.getDiscount() != null && roomType.getDiscount() > 0 && roomType.getDiscountEnd() != null) {
            if (java.time.LocalDateTime.now().isBefore(roomType.getDiscountEnd())) {
                pricePerNight = pricePerNight.multiply(BigDecimal.valueOf(100 - roomType.getDiscount())).divide(BigDecimal.valueOf(100));
            }
        }
        
        BigDecimal totalPrice = pricePerNight.multiply(BigDecimal.valueOf(days));
        booking.setTotalPrice(totalPrice);
        
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    @Override
    public void deleteBooking(Integer id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Booking ID: " + id));
        
        Room room = booking.getRoom();
        if (room != null) {
            room.setBookingStatus(RoomBookingStatus.AVAILABLE);
            roomRepository.save(room);
        }

        bookingRepository.delete(booking);
    }
}
