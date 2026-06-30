package com.hoteltracker.service.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "price_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "dynamic_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal dynamicPrice;

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(name = "applied_date", nullable = false)
    private LocalDate appliedDate;
}
