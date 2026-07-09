package com.hoteltracker.service.dtos.request;

import com.hoteltracker.service.model.enums.RoomStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RoomTypeRequest {
    @NotBlank(message = "Tên loại phòng không được để trống")
    private String name;

    @NotNull(message = "Giá cơ bản không được để trống")
    @Min(value = 0, message = "Giá không thể âm")
    private BigDecimal basePrice;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1")
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

    @NotNull(message = "Chi nhánh không được để trống")
    private Integer branchId;
}
