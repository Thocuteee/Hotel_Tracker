package com.hoteltracker.service.controller;

import com.hoteltracker.service.model.ServiceItem;
import com.hoteltracker.service.model.BookingService;
import com.hoteltracker.service.services.ServiceItemService;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceItemService serviceItemService;

    @GetMapping("/services")
    public ResponseEntity<List<ServiceItem>> getAllServices() {
        return ResponseEntity.ok(serviceItemService.getAllActiveServiceItems());
    }

    @PostMapping("/services")
    public ResponseEntity<ServiceItem> createService(@RequestBody ServiceItem item) {
        return new ResponseEntity<>(serviceItemService.createServiceItem(item), HttpStatus.CREATED);
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<ServiceItem> updateService(@PathVariable Integer id, @RequestBody ServiceItem item) {
        return ResponseEntity.ok(serviceItemService.updateServiceItem(id, item));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Integer id) {
        serviceItemService.deleteServiceItem(id);
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class AddServiceRequest {
        private Integer serviceItemId;
        private Integer quantity;
    }

    @PostMapping("/bookings/{bookingId}/services")
    public ResponseEntity<BookingService> addServiceToBooking(
            @PathVariable Integer bookingId,
            @RequestBody AddServiceRequest request) {
        BookingService saved = serviceItemService.addServiceToBooking(
                bookingId, 
                request.getServiceItemId(), 
                request.getQuantity()
        );
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/bookings/{bookingId}/services")
    public ResponseEntity<List<BookingService>> getServicesForBooking(@PathVariable Integer bookingId) {
        return ResponseEntity.ok(serviceItemService.getServicesForBooking(bookingId));
    }

    @GetMapping("/bookings/{bookingId}/invoice")
    public ResponseEntity<Map<String, Object>> getInvoiceBreakdown(@PathVariable Integer bookingId) {
        List<BookingService> services = serviceItemService.getServicesForBooking(bookingId);
        
        List<Map<String, Object>> serviceBreakdown = services.stream().map(bs -> {
            Map<String, Object> map = new HashMap<>();
            map.put("serviceName", bs.getServiceItem().getName());
            map.put("quantity", bs.getQuantity());
            map.put("priceAtOrder", bs.getPriceAtOrder());
            map.put("total", bs.getPriceAtOrder().multiply(new BigDecimal(bs.getQuantity())));
            return map;
        }).collect(Collectors.toList());

        BigDecimal servicesTotal = services.stream()
                .map(bs -> bs.getPriceAtOrder().multiply(new BigDecimal(bs.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal finalTotal = serviceItemService.calculateTotalInvoice(bookingId);
        BigDecimal roomPrice = finalTotal.subtract(servicesTotal);

        Map<String, Object> response = new HashMap<>();
        response.put("bookingId", bookingId);
        response.put("roomPrice", roomPrice);
        response.put("services", serviceBreakdown);
        response.put("servicesTotal", servicesTotal);
        response.put("finalTotal", finalTotal);

        return ResponseEntity.ok(response);
    }
}
