package com.hoteltracker.service.dtos.request;

import com.hoteltracker.service.model.enums.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentRequest {
    @NotNull(message = "Booking ID không được để trống")
    private Integer bookingId;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Số tiền không được để trống")
    @Min(value = 0, message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;
}
