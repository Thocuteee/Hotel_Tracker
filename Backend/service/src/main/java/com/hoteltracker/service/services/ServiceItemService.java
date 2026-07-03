package com.hoteltracker.service.services;

import com.hoteltracker.service.model.ServiceItem;
import com.hoteltracker.service.model.BookingService;
import java.math.BigDecimal;
import java.util.List;

public interface ServiceItemService {
    ServiceItem createServiceItem(ServiceItem item);
    List<ServiceItem> getAllActiveServiceItems();
    ServiceItem updateServiceItem(Integer id, ServiceItem item);
    void deleteServiceItem(Integer id);
    
    BookingService addServiceToBooking(Integer bookingId, Integer serviceItemId, Integer quantity);
    List<BookingService> getServicesForBooking(Integer bookingId);
    BigDecimal calculateTotalInvoice(Integer bookingId);
}
