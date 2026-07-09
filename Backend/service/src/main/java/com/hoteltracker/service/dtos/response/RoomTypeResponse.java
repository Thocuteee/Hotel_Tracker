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
    private Boolean isFeatured;
    private Boolean isPublic;
    private String status;
    private String cancellationPolicy;
    private java.time.LocalTime checkInTime;
    private java.time.LocalTime checkOutTime;
    private Boolean allowSmoking;
    private Boolean allowPets;
    private Boolean extraBedAllowed;
    private Integer branchId;
    private Integer availableRooms;
}
