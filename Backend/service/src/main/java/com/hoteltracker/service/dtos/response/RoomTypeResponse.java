package com.hoteltracker.service.dtos.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RoomTypeResponse {
    private Integer id;
    private String name;
    private BigDecimal basePrice;
    private Integer capacity;
    private String description;
    private String images; 
    private Integer discount;
    private LocalDateTime discountStart;
    private LocalDateTime discountEnd;
}
