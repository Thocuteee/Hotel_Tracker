package com.hoteltracker.service.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "booking_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_item_id", nullable = false)
    private ServiceItem serviceItem;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "price_at_order", nullable = false, precision = 12, scale = 2)
    private BigDecimal priceAtOrder;

    @Column(name = "ordered_at", nullable = false)
    private LocalDateTime orderedAt;

    @PrePersist
    protected void onCreate() {
        orderedAt = LocalDateTime.now();
    }
}
