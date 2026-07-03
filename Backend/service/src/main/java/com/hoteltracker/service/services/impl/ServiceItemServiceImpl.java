package com.hoteltracker.service.services.impl;

import com.hoteltracker.service.exceptions.ResourceNotFoundException;
import com.hoteltracker.service.model.ServiceItem;
import com.hoteltracker.service.model.BookingService;
import com.hoteltracker.service.model.Booking;
import com.hoteltracker.service.repositories.ServiceItemRepository;
import com.hoteltracker.service.repositories.BookingServiceRepository;
import com.hoteltracker.service.repositories.BookingRepository;
import com.hoteltracker.service.services.ServiceItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceItemServiceImpl implements ServiceItemService {

    private final ServiceItemRepository serviceItemRepository;
    private final BookingServiceRepository bookingServiceRepository;
    private final BookingRepository bookingRepository;

    @Override
    public ServiceItem createServiceItem(ServiceItem item) {
        item.setActive(true);
        return serviceItemRepository.save(item);
    }

    @Override
    public List<ServiceItem> getAllActiveServiceItems() {
        return serviceItemRepository.findByActiveTrue();
    }

    @Override
    public ServiceItem updateServiceItem(Integer id, ServiceItem item) {
        ServiceItem existing = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Dịch vụ với ID: " + id));
        existing.setName(item.getName());
        existing.setPrice(item.getPrice());
        if (item.getImageUrl() != null) {
            existing.setImageUrl(item.getImageUrl());
        }
        if (item.getActive() != null) {
            existing.setActive(item.getActive());
        }
        return serviceItemRepository.save(existing);
    }

    @Override
    public void deleteServiceItem(Integer id) {
        ServiceItem existing = serviceItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Dịch vụ với ID: " + id));
        existing.setActive(false);
        serviceItemRepository.save(existing);
    }

    @Override
    public BookingService addServiceToBooking(Integer bookingId, Integer serviceItemId, Integer quantity) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Đơn phòng với ID: " + bookingId));
        ServiceItem serviceItem = serviceItemRepository.findById(serviceItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Dịch vụ với ID: " + serviceItemId));

        BookingService bookingService = BookingService.builder()
                .booking(booking)
                .serviceItem(serviceItem)
                .quantity(quantity)
                .priceAtOrder(serviceItem.getPrice()) 
                .orderedAt(LocalDateTime.now())
                .build();

        return bookingServiceRepository.save(bookingService);
    }

    @Override
    public List<BookingService> getServicesForBooking(Integer bookingId) {
        return bookingServiceRepository.findByBookingId(bookingId);
    }

    @Override
    public BigDecimal calculateTotalInvoice(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Đơn phòng với ID: " + bookingId));

        BigDecimal roomCost = booking.getTotalPrice(); // Tiền phòng gốc
        
        List<BookingService> services = bookingServiceRepository.findByBookingId(bookingId);
        BigDecimal servicesCost = services.stream()
                .map(bs -> bs.getPriceAtOrder().multiply(new BigDecimal(bs.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return roomCost.add(servicesCost);
    }
}
